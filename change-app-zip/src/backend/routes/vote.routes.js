const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Vote = require('../models/vote.model');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Quiz = require('../models/quiz.model');
const Delegation = require('../models/delegation.model');
const Transaction = require('../models/transaction.model');

// @route   POST /api/proposals/:id/votes
// @desc    Cast vote on a proposal
// @access  Private
router.post('/proposals/:id/votes', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    
    if (!voteType || !['yes', 'no'].includes(voteType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vote type must be "yes" or "no"' 
      });
    }
    
    // Check if proposal exists and is active
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }
    
    if (!proposal.isVotingOpen()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Voting is closed for this proposal' 
      });
    }
    
    // Check if user has already voted
    const existingVote = await Vote.findOne({ 
      proposal: req.params.id, 
      voter: req.user.id 
    });
    
    if (existingVote) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already voted on this proposal' 
      });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user has passed the quiz or has delegations
    const quiz = await Quiz.findOne({ proposal: req.params.id });
    const hasPassedQuiz = quiz ? user.hasPassedQuiz(quiz._id) : true;
    
    if (!hasPassedQuiz) {
      return res.status(403).json({ 
        success: false, 
        message: 'You must pass the quiz before voting directly' 
      });
    }
    
    // Find delegations to this user for this proposal
    const delegations = await Delegation.find({
      proposal: req.params.id,
      delegatee: req.user.id,
      status: 'active'
    }).populate('delegator');
    
    // Create vote
    const vote = new Vote({
      proposal: req.params.id,
      voter: req.user.id,
      voteType,
      isDelegated: false,
      delegatedBy: delegations.map(d => d.delegator._id)
    });
    
    await vote.save();
    
    // Update proposal vote counts (handled by pre-save middleware in Vote model)
    
    // Award Acent to voter (competent vote)
    await Transaction.createTransaction({
      user: req.user.id,
      type: 'vote_cast',
      currencyType: 'acent',
      amount: 1,
      relatedEntity: vote._id,
      entityType: 'Vote',
      description: `Cast ${voteType} vote on proposal: ${proposal.title}`
    });
    
    // Award Acents to proposal author for 'yes' votes
    if (voteType === 'yes') {
      await Transaction.createTransaction({
        user: proposal.author,
        type: 'proposal_revenue',
        currencyType: 'acent',
        amount: 1,
        relatedEntity: vote._id,
        entityType: 'Vote',
        description: `Received yes vote on proposal: ${proposal.title}`
      });
    }
    
    // Handle delegations
    if (delegations.length > 0) {
      // Mark delegations as used
      await Promise.all(delegations.map(delegation => delegation.markAsUsed()));
      
      // Award Dcents to delegators
      await Promise.all(delegations.map(delegation => 
        Transaction.createTransaction({
          user: delegation.delegator._id,
          type: 'delegation_given',
          currencyType: 'dcent',
          amount: 1,
          relatedEntity: delegation._id,
          entityType: 'Delegation',
          description: `Delegated vote used on proposal: ${proposal.title}`
        })
      ));
      
      // Award Dcents to delegatee for each delegation
      await Transaction.createTransaction({
        user: req.user.id,
        type: 'delegation_received',
        currencyType: 'dcent',
        amount: delegations.length,
        relatedEntity: vote._id,
        entityType: 'Vote',
        description: `Received ${delegations.length} delegated votes on proposal: ${proposal.title}`
      });
    }
    
    res.status(201).json({
      success: true,
      vote,
      delegationCount: delegations.length
    });
  } catch (error) {
    console.error('Cast vote error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error casting vote',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/me/votes
// @desc    Get user's votes
// @access  Private
router.get('/users/me/votes', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Get votes
    const votes = await Vote.find({ voter: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('proposal', 'title content')
      .populate('delegatedBy', 'username name');
    
    // Get total count for pagination
    const total = await Vote.countDocuments({ voter: req.user.id });
    
    res.json({
      success: true,
      votes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user votes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving votes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

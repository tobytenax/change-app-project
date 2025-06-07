const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Delegation = require('../models/delegation.model');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Quiz = require('../models/quiz.model');
const Transaction = require('../models/transaction.model');

// @route   POST /api/proposals/:id/delegations
// @desc    Create delegation for a proposal
// @access  Private
router.post('/proposals/:id/delegations', auth, async (req, res) => {
  try {
    const { delegateeId } = req.body;
    
    if (!delegateeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Delegatee ID is required' 
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
    
    // Check if delegator and delegatee are different users
    if (req.user.id === delegateeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delegate to yourself' 
      });
    }
    
    // Check if delegatee exists
    const delegatee = await User.findById(delegateeId);
    if (!delegatee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Delegatee not found' 
      });
    }
    
    // Check if delegatee has passed the quiz
    const quiz = await Quiz.findOne({ proposal: req.params.id });
    if (quiz && !delegatee.hasPassedQuiz(quiz._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Delegatee has not passed the quiz for this proposal' 
      });
    }
    
    // Check if delegation already exists
    const existingDelegation = await Delegation.findOne({
      proposal: req.params.id,
      delegator: req.user.id
    });
    
    if (existingDelegation) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already delegated your vote for this proposal' 
      });
    }
    
    // Check if delegator has already voted
    const Vote = require('../models/vote.model');
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
    
    // Create delegation
    const delegation = new Delegation({
      proposal: req.params.id,
      delegator: req.user.id,
      delegatee: delegateeId,
      status: 'active'
    });
    
    await delegation.save();
    
    // Award Dcent to delegator
    await Transaction.createTransaction({
      user: req.user.id,
      type: 'delegation_given',
      currencyType: 'dcent',
      amount: 1,
      relatedEntity: delegation._id,
      entityType: 'Delegation',
      description: `Delegated vote on proposal: ${proposal.title}`
    });
    
    res.status(201).json({
      success: true,
      delegation
    });
  } catch (error) {
    console.error('Create delegation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating delegation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/proposals/:id/delegations/:delegationId
// @desc    Revoke delegation
// @access  Private
router.delete('/proposals/:id/delegations/:delegationId', auth, async (req, res) => {
  try {
    // Find delegation
    const delegation = await Delegation.findById(req.params.delegationId);
    
    if (!delegation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Delegation not found' 
      });
    }
    
    // Check if user is the delegator
    if (delegation.delegator.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to revoke this delegation' 
      });
    }
    
    // Check if delegation is for the correct proposal
    if (delegation.proposal.toString() !== req.params.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Delegation does not match the specified proposal' 
      });
    }
    
    // Check if delegation is still active
    if (delegation.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Delegation is no longer active' 
      });
    }
    
    // Revoke delegation
    await delegation.revoke();
    
    // Apply penalty (lose the Dcent earned from delegation)
    await Transaction.createTransaction({
      user: req.user.id,
      type: 'delegation_revocation',
      currencyType: 'dcent',
      amount: -1,
      relatedEntity: delegation._id,
      entityType: 'Delegation',
      description: `Revoked delegation on proposal`
    });
    
    res.json({
      success: true,
      message: 'Delegation revoked successfully'
    });
  } catch (error) {
    console.error('Revoke delegation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error revoking delegation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/me/delegations
// @desc    Get user's delegations
// @access  Private
router.get('/users/me/delegations', auth, async (req, res) => {
  try {
    const { type = 'given', page = 1, limit = 20 } = req.query;
    
    // Pagination
    const skip = (page - 1) * limit;
    
    let delegations;
    let total;
    
    if (type === 'given') {
      // Get delegations given by user
      delegations = await Delegation.find({ delegator: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('proposal', 'title content')
        .populate('delegatee', 'username name');
      
      total = await Delegation.countDocuments({ delegator: req.user.id });
    } else {
      // Get delegations received by user
      delegations = await Delegation.find({ delegatee: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('proposal', 'title content')
        .populate('delegator', 'username name');
      
      total = await Delegation.countDocuments({ delegatee: req.user.id });
    }
    
    res.json({
      success: true,
      delegations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get delegations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving delegations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

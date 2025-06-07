const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Quiz = require('../models/quiz.model');
const Transaction = require('../models/transaction.model');

// @route   POST /api/proposals/:id/comments
// @desc    Create comment on a proposal
// @access  Private
router.post('/proposals/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment content is required' 
      });
    }
    
    // Check if proposal exists
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
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
    
    // Check if user has passed the quiz for this proposal
    const quiz = await Quiz.findOne({ proposal: req.params.id });
    const hasPassedQuiz = quiz ? user.hasPassedQuiz(quiz._id) : false;
    
    let isCompetent = false;
    
    if (hasPassedQuiz) {
      // User has passed the quiz, can comment for free (competent comment)
      isCompetent = true;
    } else {
      // User has not passed the quiz, must spend Dcents (non-competent comment)
      if (user.dcentBalance < 3) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient Dcent balance. Creating a non-competent comment requires 3 Dcents.' 
        });
      }
      
      // Deduct Dcents via transaction
      await Transaction.createTransaction({
        user: req.user.id,
        type: 'comment_creation',
        currencyType: 'dcent',
        amount: -3, // Negative amount for spending
        relatedEntity: proposal._id,
        entityType: 'Proposal',
        description: `Created non-competent comment on proposal: ${proposal.title}`
      });
    }
    
    // Create comment
    const comment = new Comment({
      proposal: req.params.id,
      author: req.user.id,
      content,
      isCompetent
    });
    
    await comment.save();
    
    // Update proposal with comment reference
    await Proposal.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: comment._id } }
    );
    
    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/comments/:id/votes
// @desc    Vote on a comment
// @access  Private
router.post('/comments/:id/votes', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    
    if (!voteType || !['up', 'down'].includes(voteType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vote type must be "up" or "down"' 
      });
    }
    
    // Check if comment exists
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }
    
    // Check if user is not the comment author (can't vote on own comment)
    if (comment.author.toString() === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot vote on your own comment' 
      });
    }
    
    // Update comment vote count
    if (voteType === 'up') {
      await comment.addUpvote();
    } else {
      await comment.addDownvote();
    }
    
    // Award Dcent to voter (regardless of vote type)
    await Transaction.createTransaction({
      user: req.user.id,
      type: 'comment_vote',
      currencyType: 'dcent',
      amount: 1,
      relatedEntity: comment._id,
      entityType: 'Comment',
      description: `Voted ${voteType} on comment`
    });
    
    // Award Dcent to comment author for each vote
    await Transaction.createTransaction({
      user: comment.author,
      type: 'comment_vote',
      currencyType: 'dcent',
      amount: 1,
      relatedEntity: comment._id,
      entityType: 'Comment',
      description: `Received ${voteType} vote on comment`
    });
    
    res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Vote on comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error voting on comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/proposals/:id/comments/:commentId/integrate
// @desc    Integrate a comment into a proposal
// @access  Private
router.put('/proposals/:id/comments/:commentId/integrate', auth, async (req, res) => {
  try {
    // Check if proposal exists
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }
    
    // Check if user is the proposal author
    if (proposal.author.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the proposal author can integrate comments' 
      });
    }
    
    // Check if comment exists and belongs to the proposal
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }
    
    if (comment.proposal.toString() !== req.params.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment does not belong to this proposal' 
      });
    }
    
    // Check if comment is already integrated
    if (comment.isIntegrated) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment is already integrated' 
      });
    }
    
    // Integrate comment (payout is handled in the integrate method)
    await comment.integrate();
    
    res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Integrate comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error integrating comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

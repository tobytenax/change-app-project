const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Proposal = require('../models/proposal.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');

// @route   GET /api/proposals
// @desc    Get all proposals with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { scope, location, status, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (scope) filter.scope = scope;
    if (status) filter.status = status;
    
    // Handle location filtering
    if (location) {
      // Parse location object from query string
      try {
        const locationObj = JSON.parse(location);
        Object.keys(locationObj).forEach(key => {
          if (locationObj[key]) {
            filter[`location.${key}`] = locationObj[key];
          }
        });
      } catch (error) {
        console.error('Location parsing error:', error);
      }
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Get proposals
    const proposals = await Proposal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username name');
    
    // Get total count for pagination
    const total = await Proposal.countDocuments(filter);
    
    res.json({
      success: true,
      proposals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving proposals',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/proposals/:id
// @desc    Get proposal by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('author', 'username name')
      .populate('quiz');
    
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }
    
    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving proposal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/proposals
// @desc    Create a new proposal
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, location, votingDeadline } = req.body;
    
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user has enough Acents (5 Acents required)
    if (user.acentBalance < 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient Acent balance. Creating a proposal requires 5 Acents.' 
      });
    }
    
    // Create proposal
    const proposal = new Proposal({
      title,
      content,
      author: req.user.id,
      location,
      votingDeadline: votingDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
    });
    
    await proposal.save();
    
    // Create transaction to deduct Acents
    await Transaction.createTransaction({
      user: req.user.id,
      type: 'proposal_creation',
      currencyType: 'acent',
      amount: -5, // Negative amount for spending
      relatedEntity: proposal._id,
      entityType: 'Proposal',
      description: `Created proposal: ${title}`
    });
    
    res.status(201).json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating proposal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/proposals/:id
// @desc    Update a proposal
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Find proposal
    let proposal = await Proposal.findById(req.params.id);
    
    // Check if proposal exists
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }
    
    // Check if user is the author
    if (proposal.author.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this proposal' 
      });
    }
    
    // Check if proposal is still active
    if (proposal.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update a closed or escalated proposal' 
      });
    }
    
    // Update proposal
    proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    
    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating proposal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/proposals/:id/votes
// @desc    Get votes for a proposal
// @access  Public
router.get('/:id/votes', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Check if proposal exists
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Get votes
    const Vote = require('../models/vote.model');
    const votes = await Vote.find({ proposal: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('voter', 'username name')
      .populate('delegatedBy', 'username name');
    
    // Get total count for pagination
    const total = await Vote.countDocuments({ proposal: req.params.id });
    
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
    console.error('Get votes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving votes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/proposals/:id/comments
// @desc    Get comments for a proposal
// @access  Public
router.get('/:id/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Check if proposal exists
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Get comments
    const Comment = require('../models/comment.model');
    const comments = await Comment.find({ proposal: req.params.id })
      .sort({ upvotes: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username name');
    
    // Get total count for pagination
    const total = await Comment.countDocuments({ proposal: req.params.id });
    
    res.json({
      success: true,
      comments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving comments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

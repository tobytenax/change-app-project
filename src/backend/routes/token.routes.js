const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');

// @route   GET /api/users/me/balance
// @desc    Get user's coin balance
// @access  Private
router.get('/users/me/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      acentBalance: user.acentBalance,
      dcentBalance: user.dcentBalance
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving balance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/me/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/users/me/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, currencyType } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (currencyType) filter.currencyType = currencyType;
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Get transactions
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedEntity');
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);
    
    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

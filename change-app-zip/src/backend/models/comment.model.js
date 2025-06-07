const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: [true, 'Associated proposal is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters long']
  },
  isCompetent: {
    type: Boolean,
    default: false // Whether the comment was made by a user who passed the quiz
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  isIntegrated: {
    type: Boolean,
    default: false
  },
  autoIntegrated: {
    type: Boolean,
    default: false // Whether the comment was automatically integrated due to high upvotes
  },
  integrationDate: {
    type: Date
  },
  acentRevenueEarned: {
    type: Number,
    default: 0 // Total Acents earned from upvotes (for competent comments)
  },
  dcentRevenueEarned: {
    type: Number,
    default: 0 // Total Dcents earned from upvotes (for non-competent comments)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to add an upvote
commentSchema.methods.addUpvote = async function() {
  this.upvotes += 1;
  
  // Calculate revenue share if not integrated
  if (!this.isIntegrated) {
    const Proposal = mongoose.model('Proposal');
    const proposal = await Proposal.findById(this.proposal);
    
    if (proposal) {
      // Each yes vote on the proposal generates 1 Acent
      // 10% of that goes to the commenter per upvote
      const revenuePerUpvote = 0.1;
      
      if (this.isCompetent) {
        // Competent comments earn Acents
        this.acentRevenueEarned += revenuePerUpvote;
      } else {
        // Non-competent comments earn Dcents
        this.dcentRevenueEarned += revenuePerUpvote;
      }
      
      // Check if comment should be auto-integrated
      // Auto-integration happens when upvotes reach 50% of proposal's yes votes
      if (!this.isIntegrated && this.upvotes >= proposal.yesVotes * 0.5) {
        this.isIntegrated = true;
        this.autoIntegrated = true;
        this.integrationDate = new Date();
        
        // Process final payout for auto-integration
        const Transaction = mongoose.model('Transaction');
        
        if (this.isCompetent && this.acentRevenueEarned > 0) {
          await Transaction.createTransaction({
            user: this.author,
            type: 'comment_integration',
            currencyType: 'acent',
            amount: this.acentRevenueEarned,
            relatedEntity: this._id,
            entityType: 'Comment',
            description: `Auto-integration payout for comment (Acents)`
          });
        } else if (!this.isCompetent && this.dcentRevenueEarned > 0) {
          // Convert Dcents to Acents for integrated comments (alchemical conversion)
          await Transaction.createTransaction({
            user: this.author,
            type: 'comment_integration',
            currencyType: 'acent',
            amount: this.dcentRevenueEarned, // Convert Dcents to Acents
            relatedEntity: this._id,
            entityType: 'Comment',
            description: `Auto-integration payout for comment (Dcents converted to Acents)`
          });
        }
      }
    }
  }
  
  return this.save();
};

// Method to add a downvote
commentSchema.methods.addDownvote = function() {
  this.downvotes += 1;
  return this.save();
};

// Method to mark comment as integrated
commentSchema.methods.integrate = async function() {
  this.isIntegrated = true;
  this.integrationDate = new Date();
  
  // Process final payout for manual integration
  const Transaction = mongoose.model('Transaction');
  
  if (this.isCompetent && this.acentRevenueEarned > 0) {
    await Transaction.createTransaction({
      user: this.author,
      type: 'comment_integration',
      currencyType: 'acent',
      amount: this.acentRevenueEarned,
      relatedEntity: this._id,
      entityType: 'Comment',
      description: `Integration payout for comment (Acents)`
    });
  } else if (!this.isCompetent && this.dcentRevenueEarned > 0) {
    // Convert Dcents to Acents for integrated comments (alchemical conversion)
    await Transaction.createTransaction({
      user: this.author,
      type: 'comment_integration',
      currencyType: 'acent',
      amount: this.dcentRevenueEarned, // Convert Dcents to Acents
      relatedEntity: this._id,
      entityType: 'Comment',
      description: `Integration payout for comment (Dcents converted to Acents)`
    });
  }
  
  return this.save();
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

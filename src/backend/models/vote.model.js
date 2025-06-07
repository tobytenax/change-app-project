const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: [true, 'Associated proposal is required']
  },
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Voter is required']
  },
  voteType: {
    type: String,
    enum: ['yes', 'no'],
    required: [true, 'Vote type is required']
  },
  isDelegated: {
    type: Boolean,
    default: false
  },
  delegatedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per user per proposal
voteSchema.index({ proposal: 1, voter: 1 }, { unique: true });

// Pre-save middleware to update proposal vote counts
voteSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      const Proposal = mongoose.model('Proposal');
      const proposal = await Proposal.findById(this.proposal);
      
      if (!proposal) {
        return next(new Error('Proposal not found'));
      }
      
      await proposal.addVote(this.voteType);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;

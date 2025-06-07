const mongoose = require('mongoose');

const delegationSchema = new mongoose.Schema({
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: [true, 'Associated proposal is required']
  },
  delegator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Delegator is required']
  },
  delegatee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Delegatee is required']
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'used'],
    default: 'active'
  },
  revocationDate: {
    type: Date
  },
  lastRedelegationDate: {
    type: Date
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

// Compound index to ensure one delegation per delegator per proposal
delegationSchema.index({ proposal: 1, delegator: 1 }, { unique: true });

// Method to revoke delegation
delegationSchema.methods.revoke = function() {
  this.status = 'revoked';
  this.revocationDate = new Date();
  return this.save();
};

// Method to mark delegation as used (when delegatee votes)
delegationSchema.methods.markAsUsed = function() {
  this.status = 'used';
  return this.save();
};

// Method to check if redelegation is allowed
delegationSchema.methods.canRedelegate = function() {
  if (!this.lastRedelegationDate) {
    return true;
  }
  
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return this.lastRedelegationDate < oneYearAgo;
};

const Delegation = mongoose.model('Delegation', delegationSchema);

module.exports = Delegation;

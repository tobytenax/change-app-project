const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content must be at least 50 characters long']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  scope: {
    type: String,
    enum: ['neighborhood', 'city', 'state', 'region', 'country', 'worldwide', 'interplanetary'],
    default: 'neighborhood'
  },
  location: {
    neighborhood: String,
    city: String,
    state: String,
    region: String,
    country: String
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'escalated'],
    default: 'active'
  },
  votingDeadline: {
    type: Date,
    required: [true, 'Voting deadline is required']
  },
  yesVotes: {
    type: Number,
    default: 0
  },
  noVotes: {
    type: Number,
    default: 0
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  escalationThreshold: {
    type: Number,
    default: 100 // Number of yes votes needed to escalate to next level
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  revenue: {
    type: Number,
    default: 0 // Total coins earned from yes votes
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating participation rate
proposalSchema.virtual('participationRate').get(function() {
  // This would need to be calculated based on eligible voters in the scope
  // For now, return a placeholder
  return this.totalVotes > 0 ? this.totalVotes / 100 : 0;
});

// Method to check if proposal is eligible for escalation
proposalSchema.methods.isEligibleForEscalation = function() {
  return this.status === 'active' && 
         this.yesVotes >= this.escalationThreshold && 
         new Date() >= this.votingDeadline;
};

// Method to escalate proposal to next level
proposalSchema.methods.escalate = function() {
  const scopeLevels = ['neighborhood', 'city', 'state', 'region', 'country', 'worldwide', 'interplanetary'];
  const currentIndex = scopeLevels.indexOf(this.scope);
  
  if (currentIndex < scopeLevels.length - 1) {
    this.scope = scopeLevels[currentIndex + 1];
    this.status = 'active';
    this.yesVotes = 0;
    this.noVotes = 0;
    this.totalVotes = 0;
    
    // Adjust escalation threshold based on new scope
    const thresholdMultipliers = [1, 5, 10, 20, 50, 100, 200];
    this.escalationThreshold = 100 * thresholdMultipliers[currentIndex + 1];
    
    // Set new voting deadline
    const daysToAdd = [7, 14, 30, 45, 60, 90, 180][currentIndex + 1];
    this.votingDeadline = new Date();
    this.votingDeadline.setDate(this.votingDeadline.getDate() + daysToAdd);
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to add a vote
proposalSchema.methods.addVote = function(voteType) {
  if (voteType === 'yes') {
    this.yesVotes += 1;
    this.revenue += 1; // Each yes vote earns 1 coin for proposer
  } else if (voteType === 'no') {
    this.noVotes += 1;
  }
  
  this.totalVotes += 1;
  return this.save();
};

// Method to check if voting is still open
proposalSchema.methods.isVotingOpen = function() {
  return this.status === 'active' && new Date() < this.votingDeadline;
};

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;

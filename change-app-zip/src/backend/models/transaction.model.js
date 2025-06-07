const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    enum: [
      'quiz_pass', 
      'vote_cast', 
      'delegation_received', 
      'delegation_given', 
      'comment_vote', 
      'proposal_creation', 
      'comment_creation', 
      'proposal_revenue', 
      'comment_revenue', 
      'delegation_revocation',
      'comment_integration'
    ],
    required: [true, 'Transaction type is required']
  },
  currencyType: {
    type: String,
    enum: ['acent', 'dcent'],
    required: [true, 'Currency type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    enum: ['Proposal', 'Comment', 'Quiz', 'Vote', 'Delegation', 'User']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to create a transaction and update user balance
transactionSchema.statics.createTransaction = async function(transactionData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { user, type, currencyType, amount, relatedEntity, entityType, description } = transactionData;
    
    // Create the transaction
    const transaction = await this.create([{
      user,
      type,
      currencyType,
      amount,
      relatedEntity,
      entityType,
      description
    }], { session });
    
    // Update user balance
    const User = mongoose.model('User');
    const userDoc = await User.findById(user).session(session);
    
    if (!userDoc) {
      throw new Error('User not found');
    }
    
    if (currencyType === 'acent') {
      if (amount > 0) {
        await userDoc.addAcents(amount);
      } else if (amount < 0) {
        await userDoc.deductAcents(Math.abs(amount));
      }
    } else if (currencyType === 'dcent') {
      if (amount > 0) {
        await userDoc.addDcents(amount);
      } else if (amount < 0) {
        await userDoc.deductDcents(Math.abs(amount));
      }
    }
    
    await session.commitTransaction();
    session.endSession();
    
    return transaction[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

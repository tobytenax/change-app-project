const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in query results by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  location: {
    type: {
      neighborhood: String,
      city: String,
      state: String,
      region: String,
      country: String
    },
    required: [true, 'Location information is required']
  },
  acentBalance: {
    type: Number,
    default: 1 // Starting balance for new users (1 Acent for onboarding)
  },
  dcentBalance: {
    type: Number,
    default: 0 // Starting balance for new users
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  passedQuizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }]
}, {
  timestamps: true
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has passed a specific quiz
userSchema.methods.hasPassedQuiz = function(quizId) {
  return this.passedQuizzes.includes(quizId);
};

// Method to add Acents to user's balance
userSchema.methods.addAcents = function(amount) {
  this.acentBalance += amount;
  return this.save();
};

// Method to deduct Acents from user's balance
userSchema.methods.deductAcents = function(amount) {
  if (this.acentBalance < amount) {
    throw new Error('Insufficient Acent balance');
  }
  this.acentBalance -= amount;
  return this.save();
};

// Method to add Dcents to user's balance
userSchema.methods.addDcents = function(amount) {
  this.dcentBalance += amount;
  return this.save();
};

// Method to deduct Dcents from user's balance
userSchema.methods.deductDcents = function(amount) {
  if (this.dcentBalance < amount) {
    throw new Error('Insufficient Dcent balance');
  }
  this.dcentBalance -= amount;
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;

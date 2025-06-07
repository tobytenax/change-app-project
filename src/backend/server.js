const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Define routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/proposals', require('./routes/proposal.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/votes', require('./routes/vote.routes'));
app.use('/api/delegations', require('./routes/delegation.routes'));
app.use('/api/comments', require('./routes/comment.routes'));
app.use('/api/tokens', require('./routes/token.routes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Change App API' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectDB();

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Quiz = require('../models/quiz.model');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Transaction = require('../models/transaction.model');

// @route   GET /api/proposals/:id/quiz
// @desc    Get quiz for a proposal
// @access  Public
router.get('/proposals/:id/quiz', async (req, res) => {
  try {
    // Find quiz for proposal
    const quiz = await Quiz.findOne({ proposal: req.params.id });
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found for this proposal' 
      });
    }
    
    // Remove correct answers from response for security
    const sanitizedQuiz = {
      _id: quiz._id,
      proposal: quiz.proposal,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options.map(o => ({
          _id: o._id,
          optionText: o.optionText
          // isCorrect is intentionally omitted
        }))
        // explanation is intentionally omitted until after quiz attempt
      })),
      passingScore: quiz.passingScore,
      createdAt: quiz.createdAt
    };
    
    res.json({
      success: true,
      quiz: sanitizedQuiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/proposals/:id/quiz
// @desc    Create quiz for a proposal
// @access  Private
router.post('/proposals/:id/quiz', auth, async (req, res) => {
  try {
    const { title, description, questions, passingScore } = req.body;
    
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
        message: 'Only the proposal author can create a quiz' 
      });
    }
    
    // Check if quiz already exists
    let quiz = await Quiz.findOne({ proposal: req.params.id });
    if (quiz) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quiz already exists for this proposal' 
      });
    }
    
    // Create quiz
    quiz = new Quiz({
      proposal: req.params.id,
      title,
      description,
      questions,
      passingScore: passingScore || 70,
      createdBy: req.user.id
    });
    
    await quiz.save();
    
    // Update proposal with quiz reference
    await Proposal.findByIdAndUpdate(req.params.id, { quiz: quiz._id });
    
    res.status(201).json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/proposals/:id/quiz/attempts
// @desc    Submit quiz attempt
// @access  Private
router.post('/proposals/:id/quiz/attempts', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    
    // Find quiz for proposal
    const quiz = await Quiz.findOne({ proposal: req.params.id });
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found for this proposal' 
      });
    }
    
    // Calculate score
    const score = quiz.calculateScore(answers);
    const passed = quiz.isPassing(score);
    
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // If passed, add quiz to user's passed quizzes and award coin
    if (passed && !user.passedQuizzes.includes(quiz._id)) {
      user.passedQuizzes.push(quiz._id);
      await user.save();
      
      // Create transaction for coin reward
      await Transaction.createTransaction({
        user: req.user.id,
        type: 'quiz_pass',
        amount: 1,
        relatedEntity: quiz._id,
        entityType: 'Quiz',
        description: `Passed quiz for proposal: ${quiz.title}`
      });
    }
    
    // Return quiz results with explanations
    const quizResults = {
      score,
      passed,
      questions: quiz.questions.map((q, index) => ({
        questionText: q.questionText,
        userAnswer: answers[index],
        correctAnswer: q.options.find(o => o.isCorrect)._id,
        explanation: q.explanation
      }))
    };
    
    res.json({
      success: true,
      quizAttempt: quizResults
    });
  } catch (error) {
    console.error('Quiz attempt error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error processing quiz attempt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/me/quiz-attempts
// @desc    Get user's quiz attempts
// @access  Private
router.get('/users/me/quiz-attempts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('passedQuizzes');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      passedQuizzes: user.passedQuizzes
    });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving quiz attempts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: [true, 'Associated proposal is required']
  },
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Quiz description is required']
  },
  questions: [{
    questionText: {
      type: String,
      required: [true, 'Question text is required']
    },
    options: [{
      optionText: {
        type: String,
        required: [true, 'Option text is required']
      },
      isCorrect: {
        type: Boolean,
        required: true
      }
    }],
    explanation: {
      type: String,
      required: [true, 'Explanation is required']
    }
  }],
  passingScore: {
    type: Number,
    required: [true, 'Passing score is required'],
    min: [1, 'Passing score must be at least 1'],
    default: 70 // Percentage required to pass
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Quiz creator is required']
  }
}, {
  timestamps: true
});

// Method to check if a score passes the quiz
quizSchema.methods.isPassing = function(score) {
  return score >= this.passingScore;
};

// Method to calculate score from answers
quizSchema.methods.calculateScore = function(answers) {
  if (!answers || answers.length !== this.questions.length) {
    return 0;
  }
  
  let correctAnswers = 0;
  
  for (let i = 0; i < this.questions.length; i++) {
    const question = this.questions[i];
    const answer = answers[i];
    
    // Find the selected option
    const selectedOption = question.options.find(option => 
      option._id.toString() === answer.toString()
    );
    
    if (selectedOption && selectedOption.isCorrect) {
      correctAnswers++;
    }
  }
  
  return (correctAnswers / this.questions.length) * 100;
};

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;

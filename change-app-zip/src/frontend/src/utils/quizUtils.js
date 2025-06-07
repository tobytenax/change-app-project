/**
 * Utility functions for quiz management and competence verification
 */

/**
 * Calculate quiz score based on answers
 * @param {Array} questions - Array of quiz questions
 * @param {Array} answers - Array of user answers
 * @returns {number} Score as percentage (0-100)
 */
export const calculateQuizScore = (questions, answers) => {
  if (!questions || !answers || questions.length === 0) {
    return 0;
  }
  
  let correctAnswers = 0;
  
  answers.forEach(answer => {
    const question = questions[answer.questionIndex];
    if (question && question.options[answer.selectedOption]?.isCorrect) {
      correctAnswers++;
    }
  });
  
  return Math.round((correctAnswers / questions.length) * 100);
};

/**
 * Check if user has passed a specific quiz
 * @param {string} quizId - ID of the quiz
 * @param {Array} passedQuizzes - Array of passed quiz IDs
 * @returns {boolean} Whether user has passed the quiz
 */
export const hasPassedQuiz = (quizId, passedQuizzes) => {
  return passedQuizzes.includes(quizId);
};

/**
 * Get quiz status message based on user's quiz status
 * @param {boolean} hasPassed - Whether user has passed the quiz
 * @param {number} passingScore - Required passing score
 * @returns {Object} Object containing status message and severity
 */
export const getQuizStatusMessage = (hasPassed, passingScore) => {
  if (hasPassed) {
    return {
      message: 'You have passed this quiz and can vote directly on this proposal.',
      severity: 'success'
    };
  } else {
    return {
      message: `You need to pass the quiz with a score of at least ${passingScore}% to vote directly. Alternatively, you can delegate your vote.`,
      severity: 'info'
    };
  }
};

/**
 * Check if a user can perform an action based on competence
 * @param {string} action - Action type ('vote', 'comment', etc.)
 * @param {boolean} hasPassedQuiz - Whether user has passed the relevant quiz
 * @param {Object} balances - User's currency balances
 * @returns {Object} Object containing whether action is allowed and any messages
 */
export const canPerformAction = (action, hasPassedQuiz, balances) => {
  switch (action) {
    case 'vote':
      if (hasPassedQuiz) {
        return { allowed: true };
      } else {
        return { 
          allowed: false, 
          message: 'You must pass the quiz before voting directly. Take the quiz or delegate your vote.',
          severity: 'warning'
        };
      }
    
    case 'comment':
      if (hasPassedQuiz) {
        return { 
          allowed: true,
          message: 'You have passed the quiz. Your comment will be marked as competent.',
          severity: 'success'
        };
      } else if (balances.dcentBalance >= 3) {
        return { 
          allowed: true,
          message: 'You have not passed the quiz. Creating a comment will cost 3 Dcents.',
          severity: 'info'
        };
      } else {
        return { 
          allowed: false,
          message: 'Insufficient Dcent balance. Creating a non-competent comment requires 3 Dcents.',
          severity: 'error'
        };
      }
    
    case 'delegate':
      if (!hasPassedQuiz) {
        return { allowed: true };
      } else {
        return { 
          allowed: false,
          message: 'You have already passed the quiz and can vote directly.',
          severity: 'info'
        };
      }
      
    default:
      return { allowed: true };
  }
};

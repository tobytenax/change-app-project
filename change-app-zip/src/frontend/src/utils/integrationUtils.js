/**
 * Integration middleware for token and quiz systems
 * This file connects the token economy and quiz competence verification
 * across all features of the Change App
 */

import { store } from '../store';
import { getUserBalance } from '../slices/tokenSlice';
import { getUserQuizAttempts } from '../slices/quizSlice';
import { setAlert } from '../slices/alertSlice';
import { getOperationCost, hasSufficientBalance } from './tokenUtils';
import { hasPassedQuiz, canPerformAction } from './quizUtils';

/**
 * Check if user can perform a token-based operation
 * @param {string} operation - Operation type
 * @returns {boolean} Whether operation is allowed
 */
export const checkOperationAllowed = (operation) => {
  const state = store.getState();
  const { acentBalance, dcentBalance } = state.token;
  
  const cost = getOperationCost(operation);
  const balance = cost.currencyType === 'acent' ? acentBalance : dcentBalance;
  
  if (!hasSufficientBalance(balance, cost.amount)) {
    store.dispatch(setAlert({
      type: 'error',
      message: `Insufficient ${cost.currencyType === 'acent' ? 'Acent' : 'Dcent'} balance. This operation requires ${cost.amount} ${cost.currencyType === 'acent' ? 'Acents' : 'Dcents'}.`
    }));
    return false;
  }
  
  return true;
};

/**
 * Check if user can perform a competence-based action
 * @param {string} action - Action type
 * @param {string} quizId - ID of the relevant quiz
 * @returns {boolean} Whether action is allowed
 */
export const checkActionAllowed = (action, quizId) => {
  const state = store.getState();
  const { passedQuizzes } = state.quiz;
  const { acentBalance, dcentBalance } = state.token;
  
  const quizPassed = hasPassedQuiz(quizId, passedQuizzes);
  const result = canPerformAction(action, quizPassed, { acentBalance, dcentBalance });
  
  if (!result.allowed && result.message) {
    store.dispatch(setAlert({
      type: result.severity || 'warning',
      message: result.message
    }));
  }
  
  return result.allowed;
};

/**
 * Refresh user's token and quiz state
 * Call this after operations that might affect balances or quiz status
 */
export const refreshUserState = () => {
  store.dispatch(getUserBalance());
  store.dispatch(getUserQuizAttempts());
};

/**
 * Handle token transaction feedback
 * @param {string} action - Action that triggered the transaction
 * @param {string} currencyType - Type of currency involved
 * @param {number} amount - Amount of currency
 * @param {boolean} isDeduction - Whether this is a deduction or addition
 */
export const handleTransactionFeedback = (action, currencyType, amount, isDeduction) => {
  let message = '';
  
  if (isDeduction) {
    message = `${amount} ${currencyType === 'acent' ? 'Acents' : 'Dcents'} have been deducted for ${action}.`;
  } else {
    message = `You earned ${amount} ${currencyType === 'acent' ? 'Acents' : 'Dcents'} for ${action}.`;
  }
  
  store.dispatch(setAlert({
    type: isDeduction ? 'info' : 'success',
    message
  }));
};

/**
 * Initialize token and quiz integration
 * Call this when the app starts
 */
export const initializeIntegration = () => {
  refreshUserState();
};

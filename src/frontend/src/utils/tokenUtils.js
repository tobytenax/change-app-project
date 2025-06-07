/**
 * Utility functions for token management and currency operations
 */

/**
 * Format currency value with appropriate symbol
 * @param {number} amount - The amount to format
 * @param {string} currencyType - Either 'acent' or 'dcent'
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyType) => {
  if (currencyType === 'acent') {
    return `${amount} ${amount === 1 ? 'Acent' : 'Acents'}`;
  } else if (currencyType === 'dcent') {
    return `${amount} ${amount === 1 ? 'Dcent' : 'Dcents'}`;
  }
  return `${amount}`;
};

/**
 * Get color for currency type
 * @param {string} currencyType - Either 'acent' or 'dcent'
 * @returns {string} Color name for the currency
 */
export const getCurrencyColor = (currencyType) => {
  return currencyType === 'acent' ? 'success' : 'info';
};

/**
 * Check if user has sufficient balance for an operation
 * @param {number} balance - Current balance
 * @param {number} requiredAmount - Amount needed
 * @returns {boolean} Whether user has sufficient balance
 */
export const hasSufficientBalance = (balance, requiredAmount) => {
  return balance >= requiredAmount;
};

/**
 * Get cost description for various operations
 * @param {string} operation - Operation type
 * @returns {Object} Object containing cost amount and currency type
 */
export const getOperationCost = (operation) => {
  switch (operation) {
    case 'create_proposal':
      return { amount: 5, currencyType: 'acent' };
    case 'non_competent_comment':
      return { amount: 3, currencyType: 'dcent' };
    default:
      return { amount: 0, currencyType: 'acent' };
  }
};

/**
 * Get reward description for various actions
 * @param {string} action - Action type
 * @returns {Object} Object containing reward amount and currency type
 */
export const getActionReward = (action) => {
  switch (action) {
    case 'pass_quiz':
      return { amount: 1, currencyType: 'acent' };
    case 'vote':
      return { amount: 1, currencyType: 'acent' };
    case 'delegate':
      return { amount: 1, currencyType: 'dcent' };
    case 'receive_delegation':
      return { amount: 1, currencyType: 'dcent' };
    case 'comment_vote':
      return { amount: 1, currencyType: 'dcent' };
    case 'receive_comment_vote':
      return { amount: 1, currencyType: 'dcent' };
    default:
      return { amount: 0, currencyType: 'acent' };
  }
};

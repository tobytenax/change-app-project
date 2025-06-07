/**
 * Integration tests for token and quiz systems
 * Tests the interaction between token economy and competence verification
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Quiz = require('../models/quiz.model');
const Transaction = require('../models/transaction.model');

describe('Token and Quiz Integration Tests', () => {
  let userToken;
  let userId;
  let proposalId;
  let quizId;
  
  // Setup test user and data
  beforeAll(async () => {
    // Clear relevant collections
    await User.deleteMany({});
    await Proposal.deleteMany({});
    await Quiz.deleteMany({});
    await Transaction.deleteMany({});
    
    // Register test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        location: {
          city: 'Test City',
          country: 'Test Country'
        }
      });
    
    userToken = userResponse.body.token;
    userId = userResponse.body.user._id;
    
    // Give user some initial balance
    await User.findByIdAndUpdate(userId, {
      acentBalance: 10,
      dcentBalance: 10
    });
    
    // Create a test proposal
    const proposalResponse = await request(app)
      .post('/api/proposals')
      .set('x-auth-token', userToken)
      .send({
        title: 'Test Proposal',
        content: 'This is a test proposal for integration testing',
        scope: 'city',
        location: {
          city: 'Test City',
          country: 'Test Country'
        }
      });
    
    proposalId = proposalResponse.body._id;
    
    // Create a test quiz for the proposal
    const quizResponse = await request(app)
      .post(`/api/quizzes/${proposalId}`)
      .set('x-auth-token', userToken)
      .send({
        title: 'Test Quiz',
        description: 'Test quiz for integration testing',
        passingScore: 70,
        questions: [
          {
            questionText: 'Test question 1?',
            options: [
              { optionText: 'Wrong answer', isCorrect: false },
              { optionText: 'Correct answer', isCorrect: true },
              { optionText: 'Wrong answer 2', isCorrect: false }
            ],
            explanation: 'Explanation for question 1'
          },
          {
            questionText: 'Test question 2?',
            options: [
              { optionText: 'Correct answer', isCorrect: true },
              { optionText: 'Wrong answer', isCorrect: false },
              { optionText: 'Wrong answer 2', isCorrect: false }
            ],
            explanation: 'Explanation for question 2'
          }
        ]
      });
    
    quizId = quizResponse.body._id;
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  describe('Proposal Creation with Acent Cost', () => {
    it('should deduct 5 Acents when creating a proposal', async () => {
      // Get initial balance
      const initialUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      const initialAcentBalance = initialUserResponse.body.acentBalance;
      
      // Create a proposal
      await request(app)
        .post('/api/proposals')
        .set('x-auth-token', userToken)
        .send({
          title: 'Another Test Proposal',
          content: 'This is another test proposal',
          scope: 'city',
          location: {
            city: 'Test City',
            country: 'Test Country'
          }
        });
      
      // Check updated balance
      const updatedUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      expect(updatedUserResponse.body.acentBalance).toBe(initialAcentBalance - 5);
      
      // Check transaction record
      const transactionsResponse = await request(app)
        .get('/api/users/me/transactions')
        .set('x-auth-token', userToken);
      
      const proposalTransaction = transactionsResponse.body.transactions.find(
        t => t.type === 'proposal_creation' && t.amount === -5 && t.currencyType === 'acent'
      );
      
      expect(proposalTransaction).toBeTruthy();
    });
  });
  
  describe('Quiz Passing and Voting', () => {
    it('should award 1 Acent for passing a quiz', async () => {
      // Get initial balance
      const initialUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      const initialAcentBalance = initialUserResponse.body.acentBalance;
      
      // Submit correct quiz answers
      await request(app)
        .post(`/api/quizzes/${proposalId}/attempt`)
        .set('x-auth-token', userToken)
        .send({
          answers: [
            { questionIndex: 0, selectedOption: 1 },
            { questionIndex: 1, selectedOption: 0 }
          ]
        });
      
      // Check updated balance
      const updatedUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      expect(updatedUserResponse.body.acentBalance).toBe(initialAcentBalance + 1);
      
      // Check transaction record
      const transactionsResponse = await request(app)
        .get('/api/users/me/transactions')
        .set('x-auth-token', userToken);
      
      const quizTransaction = transactionsResponse.body.transactions.find(
        t => t.type === 'quiz_pass' && t.amount === 1 && t.currencyType === 'acent'
      );
      
      expect(quizTransaction).toBeTruthy();
    });
    
    it('should award 1 Acent for voting after passing the quiz', async () => {
      // Get initial balance
      const initialUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      const initialAcentBalance = initialUserResponse.body.acentBalance;
      
      // Cast a vote
      await request(app)
        .post(`/api/votes/${proposalId}`)
        .set('x-auth-token', userToken)
        .send({
          voteType: 'yes'
        });
      
      // Check updated balance
      const updatedUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      expect(updatedUserResponse.body.acentBalance).toBe(initialAcentBalance + 1);
      
      // Check transaction record
      const transactionsResponse = await request(app)
        .get('/api/users/me/transactions')
        .set('x-auth-token', userToken);
      
      const voteTransaction = transactionsResponse.body.transactions.find(
        t => t.type === 'vote_cast' && t.amount === 1 && t.currencyType === 'acent'
      );
      
      expect(voteTransaction).toBeTruthy();
    });
  });
  
  describe('Commenting System', () => {
    it('should allow free commenting for users who passed the quiz', async () => {
      // Get initial balance
      const initialUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      const initialAcentBalance = initialUserResponse.body.acentBalance;
      const initialDcentBalance = initialUserResponse.body.dcentBalance;
      
      // Create a comment
      const commentResponse = await request(app)
        .post(`/api/comments/${proposalId}`)
        .set('x-auth-token', userToken)
        .send({
          content: 'This is a competent comment'
        });
      
      expect(commentResponse.body.isCompetent).toBe(true);
      
      // Check balances remain unchanged
      const updatedUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      expect(updatedUserResponse.body.acentBalance).toBe(initialAcentBalance);
      expect(updatedUserResponse.body.dcentBalance).toBe(initialDcentBalance);
    });
    
    it('should award 1 Dcent for voting on a comment', async () => {
      // Create a comment to vote on
      const commentResponse = await request(app)
        .post(`/api/comments/${proposalId}`)
        .set('x-auth-token', userToken)
        .send({
          content: 'Another comment for testing voting'
        });
      
      const commentId = commentResponse.body._id;
      
      // Get initial balance
      const initialUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      const initialDcentBalance = initialUserResponse.body.dcentBalance;
      
      // Vote on the comment
      await request(app)
        .post(`/api/comments/${commentId}/vote`)
        .set('x-auth-token', userToken)
        .send({
          voteType: 'up'
        });
      
      // Check updated balance
      const updatedUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      expect(updatedUserResponse.body.dcentBalance).toBe(initialDcentBalance + 1);
      
      // Check transaction record
      const transactionsResponse = await request(app)
        .get('/api/users/me/transactions')
        .set('x-auth-token', userToken);
      
      const commentVoteTransaction = transactionsResponse.body.transactions.find(
        t => t.type === 'comment_vote' && t.amount === 1 && t.currencyType === 'dcent'
      );
      
      expect(commentVoteTransaction).toBeTruthy();
    });
  });
  
  describe('Delegation System', () => {
    let secondUserId;
    let secondUserToken;
    
    beforeAll(async () => {
      // Register second test user
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'password123',
          name: 'Test User 2',
          location: {
            city: 'Test City',
            country: 'Test Country'
          }
        });
      
      secondUserToken = userResponse.body.token;
      secondUserId = userResponse.body.user._id;
    });
    
    it('should award 1 Dcent for delegating a vote', async () => {
      // Get initial balance
      const initialUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', secondUserToken);
      
      const initialDcentBalance = initialUserResponse.body.dcentBalance;
      
      // Delegate vote
      await request(app)
        .post(`/api/delegations/${proposalId}`)
        .set('x-auth-token', secondUserToken)
        .send({
          delegateeId: userId
        });
      
      // Check updated balance
      const updatedUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', secondUserToken);
      
      expect(updatedUserResponse.body.dcentBalance).toBe(initialDcentBalance + 1);
      
      // Check transaction record
      const transactionsResponse = await request(app)
        .get('/api/users/me/transactions')
        .set('x-auth-token', secondUserToken);
      
      const delegationTransaction = transactionsResponse.body.transactions.find(
        t => t.type === 'delegation_given' && t.amount === 1 && t.currencyType === 'dcent'
      );
      
      expect(delegationTransaction).toBeTruthy();
    });
    
    it('should award 1 Dcent to the delegatee when they vote', async () => {
      // Get initial balance
      const initialUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      const initialDcentBalance = initialUserResponse.body.dcentBalance;
      
      // Create a new proposal for this test
      const proposalResponse = await request(app)
        .post('/api/proposals')
        .set('x-auth-token', userToken)
        .send({
          title: 'Delegation Test Proposal',
          content: 'This is a test proposal for delegation testing',
          scope: 'city',
          location: {
            city: 'Test City',
            country: 'Test Country'
          }
        });
      
      const newProposalId = proposalResponse.body._id;
      
      // Create a quiz for the proposal
      const quizResponse = await request(app)
        .post(`/api/quizzes/${newProposalId}`)
        .set('x-auth-token', userToken)
        .send({
          title: 'Delegation Test Quiz',
          description: 'Test quiz for delegation testing',
          passingScore: 70,
          questions: [
            {
              questionText: 'Test question?',
              options: [
                { optionText: 'Wrong answer', isCorrect: false },
                { optionText: 'Correct answer', isCorrect: true }
              ],
              explanation: 'Explanation'
            }
          ]
        });
      
      // Pass the quiz
      await request(app)
        .post(`/api/quizzes/${newProposalId}/attempt`)
        .set('x-auth-token', userToken)
        .send({
          answers: [
            { questionIndex: 0, selectedOption: 1 }
          ]
        });
      
      // Second user delegates to first user
      await request(app)
        .post(`/api/delegations/${newProposalId}`)
        .set('x-auth-token', secondUserToken)
        .send({
          delegateeId: userId
        });
      
      // First user votes
      await request(app)
        .post(`/api/votes/${newProposalId}`)
        .set('x-auth-token', userToken)
        .send({
          voteType: 'yes'
        });
      
      // Check updated balance
      const updatedUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', userToken);
      
      // Should get 1 Acent for voting + 1 Dcent for delegation
      expect(updatedUserResponse.body.dcentBalance).toBeGreaterThan(initialDcentBalance);
      
      // Check transaction record
      const transactionsResponse = await request(app)
        .get('/api/users/me/transactions')
        .set('x-auth-token', userToken);
      
      const delegationReceivedTransaction = transactionsResponse.body.transactions.find(
        t => t.type === 'delegation_received' && t.amount === 1 && t.currencyType === 'dcent'
      );
      
      expect(delegationReceivedTransaction).toBeTruthy();
    });
  });
  
  describe('Comment Integration System', () => {
    it('should convert Dcents to Acents when a comment is integrated', async () => {
      // Create a new proposal
      const proposalResponse = await request(app)
        .post('/api/proposals')
        .set('x-auth-token', userToken)
        .send({
          title: 'Integration Test Proposal',
          content: 'This is a test proposal for comment integration testing',
          scope: 'city',
          location: {
            city: 'Test City',
            country: 'Test Country'
          }
        });
      
      const newProposalId = proposalResponse.body._id;
      
      // Second user creates a comment
      const commentResponse = await request(app)
        .post(`/api/comments/${newProposalId}`)
        .set('x-auth-token', secondUserToken)
        .send({
          content: 'This is a comment that should be integrated'
        });
      
      const commentId = commentResponse.body._id;
      
      // Get initial balances
      const initialSecondUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', secondUserToken);
      
      const initialDcentBalance = initialSecondUserResponse.body.dcentBalance;
      const initialAcentBalance = initialSecondUserResponse.body.acentBalance;
      
      // First user integrates the comment
      await request(app)
        .post(`/api/comments/${commentId}/integrate`)
        .set('x-auth-token', userToken)
        .send({
          proposalId: newProposalId
        });
      
      // Check updated balances
      const updatedSecondUserResponse = await request(app)
        .get('/api/users/me')
        .set('x-auth-token', secondUserToken);
      
      // Should convert some Dcents to Acents
      expect(updatedSecondUserResponse.body.acentBalance).toBeGreaterThan(initialAcentBalance);
      
      // Check transaction records
      const transactionsResponse = await request(app)
        .get('/api/users/me/transactions')
        .set('x-auth-token', secondUserToken);
      
      const integrationTransaction = transactionsResponse.body.transactions.find(
        t => t.type === 'comment_integration' && t.amount > 0 && t.currencyType === 'acent'
      );
      
      expect(integrationTransaction).toBeTruthy();
    });
  });
});

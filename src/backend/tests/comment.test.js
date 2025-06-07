const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Comment = require('../models/comment.model');
const Transaction = require('../models/transaction.model');
const Quiz = require('../models/quiz.model');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let userId;
let proposalId;

// Setup and teardown for tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create a test user
  const user = new User({
    username: 'commentuser',
    email: 'comment@example.com',
    password: 'password123',
    name: 'Comment User',
    location: {
      neighborhood: 'Test Neighborhood',
      city: 'Test City',
      state: 'Test State',
      region: 'Test Region',
      country: 'Test Country'
    },
    acentBalance: 10,
    dcentBalance: 10
  });
  await user.save();
  userId = user._id;

  // Generate token
  token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'changeapp_jwt_secret',
    { expiresIn: '1h' }
  );

  // Create a test proposal
  const proposal = await Proposal.create({
    title: 'Test Proposal',
    content: 'Content for test proposal',
    author: userId,
    location: {
      neighborhood: 'Test Neighborhood',
      city: 'Test City',
      state: 'Test State',
      region: 'Test Region',
      country: 'Test Country'
    },
    scope: 'neighborhood',
    status: 'active',
    votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  proposalId = proposal._id;

  // Create a quiz for the proposal
  const quiz = await Quiz.create({
    proposal: proposalId,
    title: 'Test Quiz',
    description: 'Quiz for test proposal',
    questions: [
      {
        questionText: 'Test question?',
        options: [
          { optionText: 'Option 1', isCorrect: true },
          { optionText: 'Option 2', isCorrect: false }
        ],
        explanation: 'Test explanation'
      }
    ],
    passingScore: 70,
    createdBy: userId
  });

  // Update proposal with quiz reference
  await Proposal.findByIdAndUpdate(proposalId, { quiz: quiz._id });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Comment Routes', () => {
  beforeEach(async () => {
    await Comment.deleteMany({});
    await Transaction.deleteMany({});
    
    // Reset user's balance
    await User.findByIdAndUpdate(userId, { acentBalance: 10, dcentBalance: 10 });
    
    // Reset user's passed quizzes
    await User.findByIdAndUpdate(userId, { passedQuizzes: [] });
  });

  describe('POST /api/proposals/:id/comments', () => {
    it('should create a competent comment when user has passed quiz', async () => {
      // Mark user as having passed the quiz
      const quiz = await Quiz.findOne({ proposal: proposalId });
      await User.findByIdAndUpdate(userId, { $push: { passedQuizzes: quiz._id } });
      
      const commentData = {
        content: 'This is a test comment that is long enough to meet requirements.'
      };

      const response = await request(app)
        .post(`/api/proposals/${proposalId}/comments`)
        .set('x-auth-token', token)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.comment).toBeDefined();
      expect(response.body.comment.content).toBe(commentData.content);
      expect(response.body.comment.isCompetent).toBe(true);
      
      // Check that no Dcents were deducted (competent comments are free)
      const user = await User.findById(userId);
      expect(user.dcentBalance).toBe(10); // Should remain unchanged
    });

    it('should create a non-competent comment and deduct Dcents', async () => {
      // User has not passed the quiz
      const commentData = {
        content: 'This is a test comment that is long enough to meet requirements.'
      };

      const response = await request(app)
        .post(`/api/proposals/${proposalId}/comments`)
        .set('x-auth-token', token)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.comment).toBeDefined();
      expect(response.body.comment.content).toBe(commentData.content);
      expect(response.body.comment.isCompetent).toBe(false);
      
      // Check that Dcents were deducted
      const user = await User.findById(userId);
      expect(user.dcentBalance).toBe(7); // 10 - 3 = 7
      
      // Check that transaction was created
      const transaction = await Transaction.findOne({ 
        user: userId,
        type: 'comment_creation',
        currencyType: 'dcent',
        amount: -3
      });
      expect(transaction).toBeTruthy();
    });

    it('should not create non-competent comment with insufficient Dcent balance', async () => {
      // Set user balance to 2 Dcents (not enough)
      await User.findByIdAndUpdate(userId, { dcentBalance: 2 });
      
      const commentData = {
        content: 'This is a test comment that is long enough to meet requirements.'
      };

      const response = await request(app)
        .post(`/api/proposals/${proposalId}/comments`)
        .set('x-auth-token', token)
        .send(commentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient Dcent balance');
    });
  });

  describe('POST /api/comments/:id/votes', () => {
    let commentId;
    let otherUserId;
    let otherUserToken;

    beforeEach(async () => {
      // Create another user for voting
      const otherUser = new User({
        username: 'voteruser',
        email: 'voter@example.com',
        password: 'password123',
        name: 'Voter User',
        location: {
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'Test State',
          region: 'Test Region',
          country: 'Test Country'
        },
        dcentBalance: 5
      });
      await otherUser.save();
      otherUserId = otherUser._id;

      // Generate token for other user
      otherUserToken = jwt.sign(
        { id: otherUserId },
        process.env.JWT_SECRET || 'changeapp_jwt_secret',
        { expiresIn: '1h' }
      );

      // Create a test comment
      const comment = await Comment.create({
        proposal: proposalId,
        author: userId,
        content: 'Test comment content',
        isCompetent: false
      });
      commentId = comment._id;
    });

    it('should upvote a comment and award Dcents to voter and author', async () => {
      const response = await request(app)
        .post(`/api/comments/${commentId}/votes`)
        .set('x-auth-token', otherUserToken)
        .send({ voteType: 'up' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.comment).toBeDefined();
      expect(response.body.comment.upvotes).toBe(1);
      
      // Check that Dcent was awarded to voter
      const voter = await User.findById(otherUserId);
      expect(voter.dcentBalance).toBe(6); // 5 + 1 = 6
      
      // Check that Dcent was awarded to comment author
      const author = await User.findById(userId);
      expect(author.dcentBalance).toBe(11); // 10 + 1 = 11
      
      // Check that transactions were created
      const voterTransaction = await Transaction.findOne({ 
        user: otherUserId,
        type: 'comment_vote',
        currencyType: 'dcent',
        amount: 1
      });
      expect(voterTransaction).toBeTruthy();
      
      const authorTransaction = await Transaction.findOne({ 
        user: userId,
        type: 'comment_vote',
        currencyType: 'dcent',
        amount: 1
      });
      expect(authorTransaction).toBeTruthy();
    });

    it('should not allow author to vote on their own comment', async () => {
      const response = await request(app)
        .post(`/api/comments/${commentId}/votes`)
        .set('x-auth-token', token) // Using author's token
        .send({ voteType: 'up' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot vote on your own comment');
    });
  });

  describe('PUT /api/proposals/:id/comments/:commentId/integrate', () => {
    let commentId;
    let nonCompetentCommentId;

    beforeEach(async () => {
      // Create a competent comment
      const competentComment = await Comment.create({
        proposal: proposalId,
        author: userId,
        content: 'Competent comment content',
        isCompetent: true,
        upvotes: 5,
        acentRevenueEarned: 0.5 // 5 upvotes * 0.1 Acent per upvote
      });
      commentId = competentComment._id;

      // Create a non-competent comment
      const nonCompetentComment = await Comment.create({
        proposal: proposalId,
        author: userId,
        content: 'Non-competent comment content',
        isCompetent: false,
        upvotes: 5,
        dcentRevenueEarned: 0.5 // 5 upvotes * 0.1 Dcent per upvote
      });
      nonCompetentCommentId = nonCompetentComment._id;
    });

    it('should integrate a competent comment and pay out in Acents', async () => {
      const response = await request(app)
        .put(`/api/proposals/${proposalId}/comments/${commentId}/integrate`)
        .set('x-auth-token', token)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.comment).toBeDefined();
      expect(response.body.comment.isIntegrated).toBe(true);
      
      // Check that Acents were awarded to comment author
      const user = await User.findById(userId);
      expect(user.acentBalance).toBe(10.5); // 10 + 0.5 = 10.5
      
      // Check that transaction was created
      const transaction = await Transaction.findOne({ 
        user: userId,
        type: 'comment_integration',
        currencyType: 'acent',
        amount: 0.5
      });
      expect(transaction).toBeTruthy();
    });

    it('should integrate a non-competent comment and convert Dcents to Acents', async () => {
      const response = await request(app)
        .put(`/api/proposals/${proposalId}/comments/${nonCompetentCommentId}/integrate`)
        .set('x-auth-token', token)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.comment).toBeDefined();
      expect(response.body.comment.isIntegrated).toBe(true);
      
      // Check that Acents were awarded to comment author (converted from Dcents)
      const user = await User.findById(userId);
      expect(user.acentBalance).toBe(10.5); // 10 + 0.5 = 10.5
      
      // Check that transaction was created
      const transaction = await Transaction.findOne({ 
        user: userId,
        type: 'comment_integration',
        currencyType: 'acent', // Note: currency type is Acent even though original earnings were in Dcent
        amount: 0.5
      });
      expect(transaction).toBeTruthy();
    });
  });
});

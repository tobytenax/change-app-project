const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Transaction = require('../models/transaction.model');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let userId;

// Setup and teardown for tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create a test user
  const user = new User({
    username: 'proposaluser',
    email: 'proposal@example.com',
    password: 'password123',
    name: 'Proposal User',
    location: {
      neighborhood: 'Test Neighborhood',
      city: 'Test City',
      state: 'Test State',
      region: 'Test Region',
      country: 'Test Country'
    },
    acentBalance: 10 // Ensure enough balance for tests
  });
  await user.save();
  userId = user._id;

  // Generate token
  token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'changeapp_jwt_secret',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Proposal Routes', () => {
  beforeEach(async () => {
    await Proposal.deleteMany({});
    await Transaction.deleteMany({});
    
    // Reset user's balance
    await User.findByIdAndUpdate(userId, { acentBalance: 10 });
  });

  describe('POST /api/proposals', () => {
    it('should create a new proposal and deduct Acents', async () => {
      const proposalData = {
        title: 'Test Proposal',
        content: 'This is a test proposal content that is long enough to meet requirements.',
        location: {
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'Test State',
          region: 'Test Region',
          country: 'Test Country'
        }
      };

      const response = await request(app)
        .post('/api/proposals')
        .set('x-auth-token', token)
        .send(proposalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.proposal).toBeDefined();
      expect(response.body.proposal.title).toBe(proposalData.title);
      
      // Check that Acents were deducted
      const user = await User.findById(userId);
      expect(user.acentBalance).toBe(5); // 10 - 5 = 5
      
      // Check that transaction was created
      const transaction = await Transaction.findOne({ 
        user: userId,
        type: 'proposal_creation',
        currencyType: 'acent',
        amount: -5
      });
      expect(transaction).toBeTruthy();
    });

    it('should not create proposal with insufficient Acent balance', async () => {
      // Set user balance to 3 Acents (not enough)
      await User.findByIdAndUpdate(userId, { acentBalance: 3 });
      
      const proposalData = {
        title: 'Test Proposal',
        content: 'This is a test proposal content.',
        location: {
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'Test State',
          region: 'Test Region',
          country: 'Test Country'
        }
      };

      const response = await request(app)
        .post('/api/proposals')
        .set('x-auth-token', token)
        .send(proposalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient Acent balance');
    });
  });

  describe('GET /api/proposals', () => {
    beforeEach(async () => {
      // Create some test proposals
      await Proposal.create([
        {
          title: 'Proposal 1',
          content: 'Content for proposal 1',
          author: userId,
          location: {
            neighborhood: 'Neighborhood 1',
            city: 'City 1',
            state: 'State 1',
            region: 'Region 1',
            country: 'Country 1'
          },
          scope: 'neighborhood',
          status: 'active',
          votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Proposal 2',
          content: 'Content for proposal 2',
          author: userId,
          location: {
            neighborhood: 'Neighborhood 2',
            city: 'City 2',
            state: 'State 2',
            region: 'Region 2',
            country: 'Country 2'
          },
          scope: 'city',
          status: 'active',
          votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      ]);
    });

    it('should get all proposals', async () => {
      const response = await request(app)
        .get('/api/proposals')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.proposals).toBeDefined();
      expect(response.body.proposals.length).toBe(2);
    });

    it('should filter proposals by scope', async () => {
      const response = await request(app)
        .get('/api/proposals?scope=city')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.proposals).toBeDefined();
      expect(response.body.proposals.length).toBe(1);
      expect(response.body.proposals[0].scope).toBe('city');
    });
  });

  describe('GET /api/proposals/:id', () => {
    let proposalId;

    beforeEach(async () => {
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
    });

    it('should get a proposal by ID', async () => {
      const response = await request(app)
        .get(`/api/proposals/${proposalId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.proposal).toBeDefined();
      expect(response.body.proposal._id).toBe(proposalId.toString());
    });

    it('should return 404 for non-existent proposal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/proposals/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

let mongoServer;

// Setup and teardown for tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        location: {
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'Test State',
          region: 'Test Region',
          country: 'Test Country'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.acentBalance).toBe(1); // Default starting balance
      expect(response.body.user.dcentBalance).toBe(0); // Default starting balance
    });

    it('should not register a user with existing email', async () => {
      // Create a user first
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        location: {
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'Test State',
          region: 'Test Region',
          country: 'Test Country'
        }
      });

      // Try to register with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123',
          name: 'New User',
          location: {
            neighborhood: 'Test Neighborhood',
            city: 'Test City',
            state: 'Test State',
            region: 'Test Region',
            country: 'Test Country'
          }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User',
        location: {
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'Test State',
          region: 'Test Region',
          country: 'Test Country'
        }
      });
      await user.save();
    });

    it('should login a user and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('login@example.com');
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Create a test user
      const user = new User({
        username: 'meuser',
        email: 'me@example.com',
        password: 'password123',
        name: 'Me User',
        location: {
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'Test State',
          region: 'Test Region',
          country: 'Test Country'
        }
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

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('x-auth-token', token)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('me@example.com');
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

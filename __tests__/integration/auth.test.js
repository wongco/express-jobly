process.env.NODE_ENV = 'test';

// npm pacakges
const request = require('supertest');
const User = require('../../models/User');

// app imports
const app = require('../../app');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by prior tests
  await db.query('DELETE FROM users');
  await User.addUser({
    username: 'bob',
    password: '123456',
    first_name: 'bobby',
    last_name: 'wow',
    email: 'bobbbby@goodboy.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: false
  });

  await User.addUser({
    username: 'jeremy',
    password: '123456',
    first_name: 'jj',
    last_name: 'kk',
    email: 'jjkk@goodboy.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: false
  });
});

describe('POST /login', () => {
  it('user login succeeded', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'bob',
        password: '123456'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('user login failed due to bad username', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'bobbbbbbs',
        password: '123456'
      });

    const { error } = response.body;
    expect(error.status).toBe(422);
    expect(error).toHaveProperty('message');
  });

  it('user login failed due to bad password', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'bob',
        password: '12345678'
      });

    const { error } = response.body;
    expect(error.status).toBe(422);
    expect(error).toHaveProperty('message');
  });
});

afterEach(async function() {
  // delete any data created by test
  await db.query('DELETE FROM users');
});

afterAll(async function() {
  // close db connection
  await db.end();
});

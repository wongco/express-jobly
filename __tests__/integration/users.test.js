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

describe('POST /users', () => {
  it('Add a user succeeded', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        username: 'james',
        password: '123456',
        first_name: 'jaaaaaaaaames',
        last_name: 'woooo',
        email: 'jg@goodboy.com',
        photo_url: 'https://www.wow.com/pic.jpg',
        is_admin: false
      });

    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username', 'james');
    expect(user).not.toHaveProperty('password', '123456');
  });

  it('Add failed, username already exists', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        username: 'bob',
        password: '123456',
        first_name: 'bobbbbby',
        last_name: 'noone',
        email: 'whereami@nowhere.com',
        photo_url: 'https://www.wow.com/pic.jpg',
        is_admin: false
      });

    const { error } = response.body;
    expect(error.status).toBe(500);
    expect(error).toHaveProperty('message');
  });
});

describe('GET /users', () => {
  it('Get all users succeeded', async () => {
    const response = await request(app).get('/users');

    const { users } = response.body;
    expect(response.statusCode).toBe(200);
    expect(users).toHaveLength(2);
  });
});

describe('GET /users/:username', () => {
  it('Get a specific user succeeded', async () => {
    const response = await request(app).get('/users/bob');

    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username', 'bob');
  });

  it('Cannot find requested user', async () => {
    const response = await request(app).get('/users/jamie');

    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('message', 'User does not exist.');
  });
});

describe('PATCH /users/:username', () => {
  it('update a specific user succeeded', async () => {
    const response = await request(app)
      .patch('/users/bob')
      .send({
        first_name: 'bobby'
      });

    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('first_name', 'bobby');
  });

  it('Cannot find requested user', async () => {
    const response = await request(app).patch('/users/jamie');

    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('message', 'User does not exist.');
  });
});

describe('DELETE /users/:username', () => {
  it('deleted a specific user successfully', async () => {
    const response = await request(app).delete('/users/bob');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'User deleted');

    // user no longer exists
    const response2 = await request(app).get(`/users/bob`);
    expect(response2.statusCode).toBe(404);
  });

  it('Cannot find requested user', async () => {
    const response = await request(app).delete('/users/jimmmmmmt');

    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('message', 'User does not exist.');
  });
});

afterEach(async function() {
  // delete any data created by test
  await db.query('DELETE FROM companies');
});

afterAll(async function() {
  // close db connection
  await db.end();
});

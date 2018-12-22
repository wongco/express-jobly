process.env.NODE_ENV = 'test';

// npm pacakges
const request = require('supertest');
const Job = require('../../models/Job');
const Company = require('../../models/Company');
const User = require('../../models/User');

// app imports
const app = require('../../app');
const db = require('../../db');

let bobToken;
let jeremyToken;
beforeEach(async () => {
  // delete any data created by prior tests
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM users');

  await User.addUser({
    username: 'bob',
    password: '123456',
    first_name: 'bobby',
    last_name: 'wow',
    email: 'bobbbby@goodboy.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: true
  });

  await User.addUser({
    username: 'jeremy',
    password: '123456',
    first_name: 'jeremy',
    last_name: 'doan',
    email: 'doanboy@yes.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: false
  });

  await Company.addCompany({
    handle: 'roni',
    name: 'Roni Inc',
    num_employees: 5
  });

  await Company.addCompany({
    handle: 'google',
    name: 'Google Inc',
    num_employees: 5000
  });
  // add jobs
  await Job.addJob({
    title: 'CEO',
    salary: 5000000,
    equity: 0.25,
    company_handle: 'roni'
  });

  await Job.addJob({
    title: 'CTO',
    salary: 500000000,
    equity: 0.5,
    company_handle: 'google'
  });

  const bobResponse = await request(app)
    .post('/login')
    .send({
      username: 'bob',
      password: '123456'
    });

  const jeremyResponse = await request(app)
    .post('/login')
    .send({
      username: 'jeremy',
      password: '123456'
    });

  bobToken = bobResponse.body.token;
  jeremyToken = jeremyResponse.body.token;
});

describe('GET /companies', () => {
  it('Get all companies success', async () => {
    const response = await request(app)
      .get(`/companies`)
      .query({ _token: bobToken }); //check if we need it

    const { companies } = response.body;
    expect(response.statusCode).toBe(200);
    expect(companies).toHaveLength(2);
  });

  it('Get specific companies success', async () => {
    const response = await request(app)
      .get(`/companies`)
      .query({
        _token: bobToken,
        search: 'roni'
      });

    const { companies } = response.body;
    expect(response.statusCode).toBe(200);
    expect(companies).toHaveLength(1);
    expect(companies[0]).toHaveProperty('handle', 'roni');
  });

  it('Get specific companies no results success', async () => {
    const response = await request(app)
      .get(`/companies`)
      .query({
        _token: bobToken,
        search: 'uber'
      });

    const { companies } = response.body;
    expect(response.statusCode).toBe(200);
    expect(companies).toHaveLength(0);
  });

  it('Failed because of invalid params', async () => {
    const response = await request(app)
      .get(`/companies`)
      .query({
        _token: bobToken,
        min_employees: 30,
        max_employees: 10
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toEqual(
      'Check that your parameters are correct.'
    );
  });

  it('No authentication results in error', async () => {
    const response = await request(app)
      .get(`/companies`)
      .query({
        min_employees: 30,
        max_employees: 10
      });
    const { error } = response.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('message');
  });
});

describe('POST /companies', () => {
  it('Adding a company succeeded', async () => {
    const response = await request(app)
      .post(`/companies`)
      .send({
        _token: bobToken,
        handle: 'apple',
        name: 'Apple Inc',
        num_employees: 300,
        description: 'Amazing Cooking',
        logo_url: 'https://www.amazingcooking.com/logo.png'
      });

    const { company } = response.body;
    expect(response.statusCode).toBe(200);
    expect(company).toHaveProperty('handle', 'apple');
  });

  it('Adding a company failed because already exists', async () => {
    const response = await request(app)
      .post(`/companies`)
      .send({
        _token: bobToken,
        handle: 'roni',
        name: 'Roni Inc',
        num_employees: 5
      });

    const { error } = response.body;
    expect(error.status).toBe(409);
  });

  it('Adding a company failed because missing params', async () => {
    const response = await request(app)
      .post(`/companies`)
      .send({
        _token: bobToken,
        name: 'Roni Inc',
        num_employees: 5
      });

    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('message');
  });

  it('Unauthorized to add company', async () => {
    const response = await request(app)
      .post(`/companies`)
      .send({
        _token: jeremyToken,
        name: 'Roni Inc',
        num_employees: 5
      });

    const { error } = response.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('message');
  });
});

describe('GET /companies/:handle', () => {
  it('Getting a company and its related job posts succeeded', async () => {
    const response = await request(app)
      .get(`/companies/roni`)
      .query({ _token: bobToken });
    const { company } = response.body;
    expect(response.statusCode).toBe(200);
    expect(company).toHaveProperty('handle', 'roni');
    expect(Array.isArray(company.jobs)).toBe(true);
  });

  it('Getting a company failed', async () => {
    const response = await request(app)
      .get(`/companies/gin`)
      .query({ _token: bobToken });

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toEqual('Company not found.');
  });

  it('No authentication results in error', async () => {
    const response = await request(app).get(`/companies/gin`);

    const { error } = response.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('message');
  });
});

describe('PATCH /companies/:handle', () => {
  it('Patching a company succeeded', async () => {
    const response = await request(app)
      .patch(`/companies/roni`)
      .send({
        _token: bobToken,
        name: 'RoniTechCorp',
        num_employees: 1000,
        description: 'Roni Tech 2.0',
        logo_url: 'https://www.ronitechcorp.com/wow.jpg'
      });

    const { company } = response.body;
    expect(response.statusCode).toBe(200);
    expect(company).toHaveProperty('handle', 'roni');
    expect(company).toHaveProperty('num_employees', 1000);
  });

  it('Fails to update non existent company', async () => {
    const response = await request(app)
      .patch(`/companies/cranky`)
      .send({
        _token: bobToken,
        name: 'Wow',
        num_employees: 10,
        description: 'What 2.0',
        logo_url: 'https://www.iamlost.com/no.jpg'
      });

    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('message');
  });

  it('Unauthorized to update company', async () => {
    const response = await request(app)
      .patch(`/companies/roni`)
      .send({
        _token: jeremyToken,
        name: 'Wow',
        num_employees: 10,
        description: 'What 2.0',
        logo_url: 'https://www.iamlost.com/no.jpg'
      });

    const { error } = response.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('message');
  });
});

describe('DELETE /companies/:handle', () => {
  it('Deleting a company succeeded', async () => {
    const response = await request(app)
      .delete(`/companies/google`)
      .send({ _token: bobToken });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Company deleted');

    // company no longer exists
    const response2 = await request(app)
      .get(`/companies/google`)
      .query({ _token: bobToken });
    expect(response2.statusCode).toBe(404);
  });

  it('Deleting a company failed', async () => {
    const response = await request(app)
      .delete(`/companies/whowowwhen`)
      .send({ _token: bobToken });

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toEqual('Company not found.');
  });

  it('Unauthorized to delete company', async () => {
    const response = await request(app)
      .delete(`/companies/whowowwhen`)
      .send({ _token: jeremyToken });

    const { error } = response.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('message');
  });
});

afterEach(async function() {
  // delete any data created by test
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM users');
});

afterAll(async function() {
  // close db connection
  await db.end();
});

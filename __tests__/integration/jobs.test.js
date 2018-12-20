process.env.NODE_ENV = 'test';

// npm pacakges
const request = require('supertest');
const Job = require('../../models/Job');
const Company = require('../../models/Company');

// app imports
const app = require('../../app');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by prior tests
  await db.query('DELETE FROM companies');

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
});

describe('POST /jobs', () => {
  it('Adding a job succeeded', async () => {
    const response = await request(app)
      .post('/jobs')
      .send({
        title: 'CFO',
        salary: 100000,
        equity: 0.1,
        company_handle: 'google'
      });
    const { job } = response.body;
    expect(response.statusCode).toBe(200);
    expect(job).toHaveProperty('title', 'CFO');
  });

  it('Adding a job failed, equity invalid', async () => {
    const response = await request(app)
      .post('/jobs')
      .send({
        title: 'CFO',
        salary: 100000,
        equity: 5,
        company_handle: 'google'
      });
    const { error } = response.body;
    expect(error.status).toBe(500);
    expect(error).toHaveProperty('message');
  });
});

describe('GET /jobs', () => {
  it('get all jobs succeeded', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({});
    const { jobs } = response.body;
    expect(response.statusCode).toBe(200);
    expect(jobs).toHaveLength(2);
  });
  it('get specific job min_salalry = 50000000', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ min_salary: 50000000 });
    const { jobs } = response.body;
    expect(response.statusCode).toBe(200);
    expect(jobs).toHaveLength(1);
  });
  it('get specific job returned no results because min_salalry = 80000000000 ', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ min_salary: 80000000000 });
    const { jobs } = response.body;
    expect(response.statusCode).toBe(200);
    expect(jobs).toHaveLength(0);
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

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
    username: 'jimmy',
    password: '123456',
    first_name: 'jimmy',
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

describe('POST /jobs', () => {
  it('Adding a job succeeded', async () => {
    const response = await request(app)
      .post('/jobs')
      .send({
        _token: bobToken,
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
        _token: bobToken,
        title: 'CFO',
        salary: 100000,
        equity: 5,
        company_handle: 'google'
      });
    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('message');
  });

  it('Adding a job failed, missing params', async () => {
    const response = await request(app)
      .post('/jobs')
      .send({
        _token: bobToken,
        title: 'CFO',
        salary: 100000,
        equity: 5
      });
    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('message');
  });

  it('Unauthorized to add job', async () => {
    const response = await request(app)
      .post('/jobs')
      .send({
        _token: jeremyToken,
        title: 'CFO',
        salary: 100000,
        equity: 5
      });
    const { error } = response.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('message');
  });
});

describe('GET /jobs', () => {
  it('Get all jobs succeeded', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ _token: bobToken });
    const { jobs } = response.body;
    expect(response.statusCode).toBe(200);
    expect(jobs).toHaveLength(2);
  });

  it('Get specific job min_salalry = 50000000', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ _token: bobToken, min_salary: 50000000 });
    const { jobs } = response.body;
    expect(response.statusCode).toBe(200);
    expect(jobs).toHaveLength(1);
  });

  it('Get specific job returned no results because min_salalry = 80000000000 ', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ _token: bobToken, min_salary: 80000000000 });
    const { jobs } = response.body;
    expect(response.statusCode).toBe(200);
    expect(jobs).toHaveLength(0);
  });

  it('No authentication results in error', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ min_salary: 80000000000 });

    const { error } = response.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('message');
  });
});

describe('GET /jobs/:id', () => {
  it('Get any specific job succeeded', async () => {
    const jobs = await Job.getJobs({});
    const firstId = jobs[0].id;

    const response = await request(app)
      .get(`/jobs/${firstId}`)
      .query({ _token: bobToken });
    const { job } = response.body;
    expect(response.statusCode).toBe(200);
    expect(job).toHaveProperty('title', 'CEO');
  });

  it('Fail to get non existing job', async () => {
    const response = await request(app)
      .get(`/jobs/0`)
      .query({ _token: bobToken });
    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('message');
  });

  it('User passed in non number job id', async () => {
    const response = await request(app)
      .get(`/jobs/abc`)
      .query({ _token: bobToken });
    const { error } = response.body;
    expect(error.status).toBe(422);
    expect(error).toHaveProperty('message');
  });

  it('No authentication results in error', async () => {
    const response = await request(app).get(`/jobs/abc`);
    const { error } = response.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('message');
  });
});

describe('PATCH /jobs/:id', () => {
  it('Updates a specific job succeeded', async () => {
    const jobs = await Job.getJobs({});
    const firstId = jobs[0].id;

    const response = await request(app)
      .patch(`/jobs/${firstId}`)
      .send({
        _token: bobToken,
        title: 'CEEEEEEEEO',
        salary: 5,
        equity: 0.0001,
        company_handle: 'google'
      });
    const { job } = response.body;
    expect(response.statusCode).toBe(200);
    expect(job).toHaveProperty('title', 'CEEEEEEEEO');
  });

  it('Fails to update because of invalid company', async () => {
    const jobs = await Job.getJobs({});
    const firstId = jobs[0].id;

    const response = await request(app)
      .patch(`/jobs/${firstId}`)
      .send({
        _token: bobToken,
        title: 'CEEEEEEEEO',
        salary: 5,
        equity: 0.0001,
        company_handle: 'wooooooooo'
      });
    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('message');
  });

  it('Fails to update because of invalid params', async () => {
    const jobs = await Job.getJobs({});
    const firstId = jobs[0].id;

    const response = await request(app)
      .patch(`/jobs/${firstId}`)
      .send({
        _token: bobToken,
        cookies: 'yes!'
      });

    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('message');
  });

  it('Unauthorized to update job', async () => {
    const jobs = await Job.getJobs({});
    const firstId = jobs[0].id;

    const response = await request(app)
      .patch(`/jobs/${firstId}`)
      .send({
        _token: jeremyToken,
        title: 'CEEEEEEEEO',
        salary: 5,
        equity: 0.0001,
        company_handle: 'google'
      });

    const { error } = response.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('message');
  });
});

describe('DELETE /jobs/:id', () => {
  it('Deletes a specific job successfully', async () => {
    const jobs = await Job.getJobs({});
    const firstId = jobs[0].id;
    const response = await request(app)
      .delete(`/jobs/${firstId}`)
      .send({ _token: bobToken });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Job deleted');
  });

  it('Fails to delete non existing job', async () => {
    const response = await request(app)
      .delete(`/jobs/100000`)
      .send({ _token: bobToken });

    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('message', 'Job not found.');
  });

  it('Unauthorized to delete job', async () => {
    const response = await request(app)
      .delete(`/jobs/100000`)
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

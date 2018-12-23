process.env.NODE_ENV = 'test';

const Application = require('../../models/Application');
const User = require('../../models/User');
const Company = require('../../models/Company');
const Job = require('../../models/Job');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by test
  await db.query('DELETE FROM applications');
  await db.query('DELETE FROM jobs');
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM users');

  // add user
  await User.addUser({
    username: 'bob',
    password: '123456',
    first_name: 'bobby',
    last_name: 'wow',
    email: 'bobbbby@goodboy.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: false
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
    company_handle: 'google'
  });
});

describe('getApplications method', async () => {
  it('get all applications for specific user success', async () => {
    const jobs = await Job.getJobs({});
    const { id } = jobs[0];
    await Application.applyJob('bob', id, 'interested');

    const bobJobResults = await Application.getApplications('bob');
    expect(bobJobResults).toHaveLength(1);
    expect(bobJobResults[0]).toHaveProperty('state', 'interested');
  });

  it('failure to find any applications for non existent user', async () => {
    const jobResults = await Application.getApplications('jerry');
    expect(jobResults).toHaveLength(0);
  });
});

describe('applyJob method', async () => {
  it('applying to job successfully', async () => {
    const jobs = await Job.getJobs({});
    const { id } = jobs[0];
    const job = await Application.applyJob('bob', id, 'interested');

    expect(job).toHaveProperty('state', 'interested');
  });

  it('failed to apply - could not find job', async () => {
    try {
      await Application.applyJob('bob', 0, 'interested');
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });
});

afterEach(async function() {
  // delete any data created by test
  await db.query('DELETE FROM applications');
});

afterAll(async function() {
  // close db connection
  await db.end();
});

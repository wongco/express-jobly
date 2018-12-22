process.env.NODE_ENV = 'test';

const Job = require('../../models/Job');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by test
  await db.query('DELETE FROM companies');

  // insert first company
  await db.query(
    'INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3)',
    ['gavino', 'gav Inc', 5]
  );
  // insert second company
  await db.query(
    'INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3)',
    ['google', 'Google Inc', 5000]
  );

  await db.query(
    'INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4)',
    ['CEO', 1000000, 0.2, 'google']
  );

  await db.query(
    'INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4)',
    ['CTO', 90000, 0.25, 'gavino']
  );
});

describe('addJob method', async () => {
  it('adds a job successfully', async () => {
    const job = await Job.addJob({
      title: 'HR',
      salary: 70000,
      equity: 0.001,
      company_handle: 'gavino'
    });

    expect(job).toHaveProperty('title', 'HR');
  });

  it('fail bad sql query due to missing salary key', async () => {
    try {
      await Job.addJob({
        title: 'HR',
        equity: 0.001,
        company_handle: 'gavino'
      });
    } catch (err) {
      expect(err).toHaveProperty('message');
    }
  });
});

describe('getJobs method', async () => {
  it('gets all jobs successfully', async () => {
    const jobs = await Job.getJobs({});
    expect(jobs).toHaveLength(2);
  });

  it('should give us specific results', async () => {
    const companies = await Job.getJobs({ search: 'gavino' });

    expect(companies).toHaveLength(1);
    expect(companies[0]).toHaveProperty('company_handle', 'gavino');
  });

  it('should return nothing based on critera', async () => {
    const companies = await Job.getJobs({ search: 'uber' });

    expect(companies).toHaveLength(0);
  });
});

describe('getJob method', async () => {
  it('gets specific job successfully', async () => {
    const results = await db.query('SELECT id FROM jobs');
    const jobId = results.rows[0].id;
    const job = await Job.getJob(jobId);

    expect(job).toHaveProperty('id', jobId);
  });

  it('should fail to get job that does not exist', async () => {
    try {
      const job = await Job.getJob(0);
    } catch (err) {
      expect(err).toHaveProperty('message');
    }
  });
});

describe('patchJob method', async () => {
  it('should modify job successfully', async () => {
    const results = await db.query('SELECT id FROM jobs');
    const jobId = results.rows[0].id;

    const job = await Job.patchJob(jobId, { title: 'Chef' });
    expect(job).toHaveProperty('title', 'Chef');
  });

  it('should modify job successfully', async () => {
    const results = await db.query('SELECT id FROM jobs');
    const jobId = results.rows[0].id;

    const job = await Job.patchJob(jobId, { title: 'Chef' });
    expect(job).toHaveProperty('title', 'Chef');
  });

  it('should fail if company_handle does not exist', async () => {
    const results = await db.query('SELECT id FROM jobs');
    const jobId = results.rows[0].id;
    try {
      await Job.patchJob(jobId, { company_handle: 'uber' });
    } catch (error) {
      expect(error).toHaveProperty('message', 'Company not found.');
    }
  });

  it('should fail if bad attribute is provided', async () => {
    const results = await db.query('SELECT id FROM jobs');
    const jobId = results.rows[0].id;
    try {
      await Job.patchJob(jobId, { color_type: 'purple' });
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });
});

describe('deleteJob method', async () => {
  it('should delete job successfully', async () => {
    const results = await db.query('SELECT id FROM jobs');
    const jobId = results.rows[0].id;
    const job = await Job.deleteJob(jobId);

    expect(job).toHaveProperty('id', jobId);

    try {
      await Job.getJob(jobId);
    } catch (error) {
      expect(error).toHaveProperty('message', 'Job not found.');
    }
  });

  it('should fail to delete non existent job', async () => {
    try {
      await Job.getJob(0);
    } catch (error) {
      expect(error).toHaveProperty('message', 'Job not found.');
    }
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

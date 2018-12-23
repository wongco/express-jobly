const db = require('../db');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

// control function to clean up db and add new data
async function setUp() {
  await dropTables();
  await createTables();
  await usersSetup();
  await companiesSetup();
  await jobsSetup();
  await applicationsSetup();
}

// drop all existing tables
async function dropTables() {
  /* for future use
  // await db.query('DROP TABLE IF EXISTS users_tech');
  // await db.query('DROP TABLE IF EXISTS jobs_tech');
  // await db.query('DROP TABLE IF EXISTS tech');
  */
  await db.query('DROP TABLE IF EXISTS applications');
  await db.query('DROP TABLE IF EXISTS jobs');
  await db.query('DROP TABLE IF EXISTS companies');
  await db.query('DROP TABLE IF EXISTS users');
}

// create tables in db
async function createTables() {
  await db.query(`DROP TYPE state`);
  await db.query(
    `CREATE TYPE state AS ENUM ('interested', 'applied', 'accepted', 'rejected')`
  );

  await db.query(`CREATE TABLE companies
    (
        handle text PRIMARY KEY,
        name text UNIQUE,
        num_employees INTEGER,
        description text,
        logo_url text
    )`);

  await db.query(`CREATE TABLE jobs
  (
      id serial PRIMARY KEY,
      title text NOT NULL,
      salary float NOT NULL,
      equity float NOT NULL CHECK (equity <=1 and equity >=0),
      company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
      date_posted date DEFAULT CURRENT_DATE NOT NULL
  )`);

  await db.query(`CREATE TABLE users
  (
      username text PRIMARY KEY,
      password text NOT NULL,
      first_name text NOT NULL,
      last_name text NOT NULL,
      email text NOT NULL UNIQUE,
      photo_url text,
      is_admin BOOLEAN DEFAULT FALSE NOT NULL
  )`);

  await db.query(`CREATE TABLE applications 
  (
      username text REFERENCES users ON DELETE CASCADE,
      job_id integer REFERENCES jobs ON DELETE CASCADE,
      state state NOT NULL,
      created_at date DEFAULT CURRENT_DATE NOT NULL,
      PRIMARY KEY(username, job_id)
  )`);

  /* for future use
  await db.query(`CREATE TABLE tech
  (
      name text PRIMARY KEY
  );`);

  await db.query(`CREATE TABLE jobs_tech
  (
      job_id integer REFERENCES jobs ON DELETE CASCADE,
      tech_name text REFERENCES tech ON DELETE CASCADE,
      PRIMARY KEY(job_id, tech_name)
  );`);

  await db.query(`CREATE TABLE users_tech
  (
      username text REFERENCES users ON DELETE CASCADE,
      tech_name text REFERENCES tech ON DELETE CASCADE,
      PRIMARY KEY(username, tech_name)
  );`); */
}

// setup users on DB
async function usersSetup() {
  await User.addUser({
    username: 'harry',
    password: '123456',
    first_name: 'harry',
    last_name: 'hh',
    email: 'hh@abcdefghijklmon.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: true
  });

  await User.addUser({
    username: 'bob',
    password: '123456',
    first_name: 'bob',
    last_name: 'w',
    email: 'bw@abcdefghijklmon.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: true
  });

  await User.addUser({
    username: 'joe',
    password: '123456',
    first_name: 'joe',
    last_name: 'a',
    email: 'ja@yay.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: false
  });

  await User.addUser({
    username: 'michael',
    password: '123456',
    first_name: 'mic',
    last_name: 'b',
    email: 'mb@ohno.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: false
  });
}

// setup companies on DB
async function companiesSetup() {
  await Company.addCompany({
    handle: 'google',
    name: 'Google Inc.',
    num_employees: 11000
  });

  await Company.addCompany({
    handle: 'apple',
    name: 'Apple Inc.',
    num_employees: 10000
  });

  await Company.addCompany({
    handle: 'ibm',
    name: 'International Business Machines.',
    num_employees: 100000
  });

  await Company.addCompany({
    handle: 'uber',
    name: 'Uber Share Company',
    num_employees: 20000
  });
}

// setup jobs on DB
async function jobsSetup() {
  await Job.addJob({
    title: 'CEO',
    salary: 1000000,
    equity: 0.2,
    company_handle: 'google'
  });

  await Job.addJob({
    title: 'CIO',
    salary: 800000,
    equity: 0.15,
    company_handle: 'ibm'
  });

  await Job.addJob({
    title: 'CFO',
    salary: 650000,
    equity: 0.1,
    company_handle: 'apple'
  });

  await Job.addJob({
    title: 'CTO',
    salary: 700000,
    equity: 0.1,
    company_handle: 'uber'
  });
}

// setup applications on DB
async function applicationsSetup() {
  const jobs = await Job.getJobs({});
  const jobIdOne = jobs[0].id;
  const jobIdTwo = jobs[1].id;
  const jobIdThree = jobs[2].id;
  const jobIdFour = jobs[3].id;

  await Application.applyJob('harry', jobIdOne, 'applied');
  await Application.applyJob('michael', jobIdTwo, 'applied');
  await Application.applyJob('michael', jobIdThree, 'interested');
  await Application.applyJob('joe', jobIdThree, 'interested');
  await Application.applyJob('bob', jobIdFour, 'interested');
}

setUp()
  .then(resp => {
    console.log('done adding data.');
    process.exit(0);
  })
  .catch(error => {
    console.log('There was an error.');
    process.exit(1);
  });

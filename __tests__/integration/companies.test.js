process.env.NODE_ENV = 'test';

// npm pacakges
const request = require('supertest');
const Company = require('../../models/Company');

// app imports
const app = require('../../app');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by test
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
});

describe('GET /companies', () => {
  it('Get all companies success', async () => {
    const response = await request(app)
      .get(`/companies`)
      .query({});

    const { companies } = response.body;
    expect(response.statusCode).toBe(200);
    expect(companies).toHaveLength(2);
  });

  it('Get specific company success', async () => {
    const response = await request(app)
      .get(`/companies`)
      .query({
        search: 'roni'
      });

    const { companies } = response.body;
    expect(response.statusCode).toBe(200);
    expect(companies).toHaveLength(1);
    expect(companies[0]).toHaveProperty('handle', 'roni');
  });

  it('Get specific company failure', async () => {
    const response = await request(app)
      .get(`/companies`)
      .query({
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
        min_employees: 30,
        max_employees: 10
      });
    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toEqual('the parameters are incorrect');
  });
});

describe('POST /companies', () => {
  it('Adding a company succeeded', async () => {
    const response = await request(app)
      .post(`/companies`)
      .send({
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
        handle: 'roni',
        name: 'Roni Inc',
        num_employees: 5
      });

    const { error } = response.body;
    expect(error.message).toEqual(
      'duplicate key value violates unique constraint "companies_pkey"'
    );
    expect(error.status).toBe(422);
  });

  it('Adding a company failed because missing params', async () => {
    const response = await request(app)
      .post(`/companies`)
      .send({
        name: 'Roni Inc',
        num_employees: 5
      });

    const { error } = response.body;
    expect(error.status).toBe(422);
    expect(error.message).toEqual(
      'null value in column "handle" violates not-null constraint'
    );
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

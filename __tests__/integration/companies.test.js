process.env.NODE_ENV = 'test';

// npm pacakges
const request = require('supertest');
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

  it('Get specific companies success', async () => {
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

  it('Get specific companies no results success', async () => {
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
    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toEqual(
      'Check that your parameters are correct.'
    );
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
    expect(error.status).toBe(500);
    expect(error.message).toEqual('Server error occured.');
  });

  it('Adding a company failed because missing params', async () => {
    const response = await request(app)
      .post(`/companies`)
      .send({
        name: 'Roni Inc',
        num_employees: 5
      });

    const { error } = response.body;
    expect(error.status).toBe(500);
    expect(error.message).toEqual('Server error occured.');
  });
});

describe('GET /companies/:handle', () => {
  it('Getting a company succeeded', async () => {
    const response = await request(app).get(`/companies/roni`);

    const { company } = response.body;
    expect(response.statusCode).toBe(200);
    expect(company).toHaveProperty('handle', 'roni');
  });

  it('Getting a company failed', async () => {
    const response = await request(app).get(`/companies/gin`);

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toEqual('Company not found.');
  });
});

describe('PATCH /companies/:handle', () => {
  it('Patching a company succeeded', async () => {
    const response = await request(app)
      .patch(`/companies/roni`)
      .send({
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

  it('fails to update non existent company', async () => {
    const response = await request(app)
      .patch(`/companies/cranky`)
      .send({
        name: 'Wow',
        num_employees: 10,
        description: 'What 2.0',
        logo_url: 'https://www.iamlost.com/no.jpg'
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toEqual('Company not found.');
  });
});

describe('DELETE /companies/:handle', () => {
  it('deleting a company succeeded', async () => {
    const response = await request(app).delete(`/companies/google`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Company deleted');

    // company no longer exists
    const response2 = await request(app).get(`/companies/google`);
    expect(response2.statusCode).toBe(404);
  });

  it('deleting a company failed', async () => {
    const response = await request(app).delete(`/companies/whowowwhen`);

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toEqual('Company not found.');
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

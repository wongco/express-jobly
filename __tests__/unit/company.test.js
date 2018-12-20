process.env.NODE_ENV = 'test';

const Company = require('../../models/Company');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by test
  await db.query('DELETE FROM companies');

  // insert first company
  await db.query(
    'INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3)',
    ['roni', 'Roni Inc', 5]
  );
  // insert second company
  await db.query(
    'INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3)',
    ['google', 'Google Inc', 5000]
  );
});

describe('testing getCompanies function', async () => {
  it('should give us specific company success', async () => {
    const companies = await Company.getCompanies({
      search: 'roni',
      min_employees: 1,
      max_employees: 10
    });

    expect(companies).toHaveLength(1);
    expect(companies[0]).toHaveProperty('handle', 'roni');
  });

  it('should give us all the companies in database', async () => {
    const companies = await Company.getCompanies({});
    expect(companies).toHaveLength(2);
  });

  it('should fail with 404 when min > max', async () => {
    try {
      const companies = await Company.getCompanies({
        search: 'roni',
        min_employees: 30,
        max_employees: 10
      });
    } catch (err) {
      expect(err.message).toEqual('the parameters are incorrect');
      expect(err.status).toEqual(404);
    }
  });

  it('should return nothing based on critera', async () => {
    const companies = await Company.getCompanies({
      search: 'uber'
    });
    expect(companies).toHaveLength(0);
  });
});

describe('testing addCompany function', async () => {
  it('should test adding a company successfully', async () => {
    const company = await Company.addCompany({
      handle: 'gin',
      name: 'WongCo, Inc.',
      num_employees: 51
    });

    expect(company).toHaveProperty('handle', 'gin');
  });

  it('should fail adding a company that exists', async () => {
    try {
      const company = await Company.addCompany({
        handle: 'roni',
        name: 'Roni Inc',
        num_employees: 51
      });
    } catch (err) {
      expect(err.message).toEqual(
        'duplicate key value violates unique constraint "companies_pkey"'
      );
    }
  });

  it('should fail bad sql query because missing handle', async () => {
    try {
      const company = await Company.addCompany({
        name: 'Roni Inc',
        num_employees: 51
      });
    } catch (err) {
      expect(err.message).toEqual(
        'null value in column "handle" violates not-null constraint'
      );
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

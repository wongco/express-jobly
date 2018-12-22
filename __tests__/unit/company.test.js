process.env.NODE_ENV = 'test';

const Company = require('../../models/Company');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by test
  await db.query('DELETE FROM companies');

  // insert first company
  await db.query(
    'INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3)',
    ['kevin', 'kevin Inc', 5]
  );
  // insert second company
  await db.query(
    'INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3)',
    ['google', 'Google Inc', 5000]
  );
});

describe('getCompanies method', async () => {
  it('should give us specific results', async () => {
    const companies = await Company.getCompanies({
      search: 'kevin',
      min_employees: 1,
      max_employees: 10
    });

    expect(companies).toHaveLength(1);
    expect(companies[0]).toHaveProperty('handle', 'kevin');
  });

  it('should give us all the companies in database', async () => {
    const companies = await Company.getCompanies({});
    expect(companies).toHaveLength(2);
  });

  it('should fail when when min > max', async () => {
    try {
      await Company.getCompanies({
        search: 'kevin',
        min_employees: 30,
        max_employees: 10
      });
    } catch (err) {
      expect(err.message).toEqual('Check that your parameters are correct.');
    }
  });

  it('should return nothing based on critera', async () => {
    const companies = await Company.getCompanies({
      search: 'uber'
    });
    expect(companies).toHaveLength(0);
  });
});

describe('addCompany method', async () => {
  it('adding a company successfully', async () => {
    const company = await Company.addCompany({
      handle: 'carrots',
      name: 'Carrots, Inc.',
      num_employees: 51
    });

    expect(company).toHaveProperty('handle', 'carrots');
  });

  it('fail adding a company that exists', async () => {
    try {
      await Company.addCompany({
        handle: 'kevin',
        name: 'kevin Inc',
        num_employees: 51
      });
    } catch (err) {
      expect(err.message).toEqual('Company already exists.');
    }
  });

  it('fail bad sql query due to missing handle key', async () => {
    try {
      await Company.addCompany({
        name: 'kevin Inc',
        num_employees: 51
      });
    } catch (err) {
      expect(err.message).toEqual(
        'null value in column "handle" violates not-null constraint'
      );
    }
  });
});

describe('getCompany method', async () => {
  it('gets a company and its job posts successfully', async () => {
    const company = await Company.getCompany('kevin');
    expect(company).toHaveProperty('handle', 'kevin');
  });

  it('should fail company does not exist', async () => {
    try {
      await Company.getCompany('cookies');
    } catch (err) {
      expect(err.message).toEqual('Company not found.');
    }
  });
});

describe('patchCompany method', async () => {
  it('updates a company successfully', async () => {
    const company = await Company.patchCompany('kevin', {
      num_employees: 100
    });
    expect(company).toHaveProperty('handle', 'kevin');
    expect(company).toHaveProperty('num_employees', 100);
  });

  it('fails when company does not exist', async () => {
    try {
      await Company.patchCompany('carrots', {
        num_employees: 100
      });
    } catch (error) {
      expect(error.message).toEqual('Company not found.');
    }
  });

  it('fails when bad attribute is provided', async () => {
    try {
      await Company.patchCompany('kevin', {
        num_parties: 100
      });
    } catch (err) {
      expect(err.message).toEqual(
        'column "num_parties" of relation "companies" does not exist'
      );
    }
  });
});

describe('deleteCompany method', async () => {
  it('deletes a company successfully', async () => {
    const company = await Company.deleteCompany('google');
    expect(company).toHaveProperty('handle', 'google');

    try {
      await Company.getCompany('google');
    } catch (error) {
      expect(error.message).toEqual('Company not found.');
    }
  });

  it('fails when company does not exist', async () => {
    try {
      await Company.deleteCompany('wowsers');
    } catch (error) {
      expect(error.message).toEqual('Company not found.');
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

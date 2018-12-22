// we need
const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Company {
  /** getCompanies -- retreive companies details
   * input: { search, min_employees, max_employees }
   * output: [ { companyDetails}, ... ]
   */
  static async getCompanies(companyParams) {
    for (let key in companyParams) {
      if (key.startsWith('_')) {
        delete companyParams[key];
      }
    }

    for (let key in companyParams) {
      if (!companyParams[key]) {
        delete companyParams[key];
      }
    }
    let queryString = 'SELECT * FROM companies';
    const compParamsQueryArray = Object.keys(companyParams);
    const values = [];
    let counter = 1;

    if (compParamsQueryArray.length > 0) {
      queryString += ' WHERE';

      // if min_employees & max_employees keys exist, make sure min < max
      if (companyParams.min_employees && companyParams.min_employees) {
        if (companyParams.min_employees > companyParams.max_employees) {
          throw new Error('Check that your parameters are correct.');
        }
      }

      const dynamicArr = [];
      if (companyParams.search) {
        dynamicArr.push(` handle LIKE $${counter}`);
        values.push(companyParams.search);
        counter++;
      }
      if (companyParams.min_employees) {
        dynamicArr.push(` num_employees > $${counter}`);
        values.push(companyParams.min_employees);
        counter++;
      }
      if (companyParams.max_employees) {
        dynamicArr.push(` num_employees < $${counter}`);
        values.push(companyParams.max_employees);
        counter++;
      }
      queryString += dynamicArr.join(' AND');
    }

    const result = await db.query(queryString, values);
    return result.rows;
  }

  /** addCompany -- add new company
   * input: { handle, name, num_employees, description, logo_url }
   * output: { companyDetails }
   */
  static async addCompany({
    handle,
    name,
    num_employees,
    description = '',
    logo_url = ''
  }) {
    // check if company exists, other getCompany will throw error
    const checkCompany = await db.query(
      `SELECT * FROM companies WHERE handle = $1`,
      [handle]
    );
    if (checkCompany.rows.length !== 0) {
      throw new Error('Company already exists.');
    }

    const company = await db.query(
      'INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [handle, name, num_employees, description, logo_url]
    );
    return company.rows[0];
  }

  /** getCompany -- get a specific company
   * input: handle
   * output: { companyDetails }
   */
  static async getCompany(handle) {
    const company = await db.query(
      `SELECT * FROM companies WHERE handle = $1`,
      [handle]
    );

    if (company.rows.length === 0) {
      throw new Error('Company not found.');
    }
    return company.rows[0];
  }

  /** patchCompany -- get specific company
   * input: ( handlename, { name, num_employees, description, logo_url } )
   * output: { companyDetails }
   */
  static async patchCompany(handle, companyDetails) {
    // test if company exists, else throw Error
    await Company.getCompany(handle);

    const { query, values } = sqlForPartialUpdate(
      'companies',
      companyDetails,
      'handle',
      handle
    );

    const company = await db.query(query, values);

    if (company.rows.length === 0) {
      throw new Error('Company not found.');
    }
    return company.rows[0];
  }

  /** deleteCompany -- delete specific company
   * input: handle
   * output: { companyDetails }
   */
  static async deleteCompany(handle) {
    // test if company exists, else throw Error
    await Company.getCompany(handle);

    const company = await db.query(
      `DELETE FROM companies WHERE handle = $1 RETURNING *`,
      [handle]
    );

    if (company.rows.length === 0) {
      throw new Error('Company not found.');
    }
    return company.rows[0];
  }
}

module.exports = Company;

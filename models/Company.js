// we need
const db = require('../db');
const APIError = require('./ApiError');

class Company {
  /** getCompany -- retreive companies details
   *
    [{
      "handle": "apple",
      "name": "Apple Inc",
      "num_employees": 300,
      "description": null,
      "logo_url": null
    }]
   */
  static async getCompany(reqQuery) {
    // { search, min_employees, max_employees }
    for (let key in reqQuery) {
      if (!reqQuery[key]) {
        delete reqQuery[key];
      }
    }
    let queryString = 'SELECT * FROM companies';
    const reqQueryArray = Object.keys(reqQuery);
    const values = [];
    let counter = 1;

    if (reqQueryArray.length > 0) {
      queryString += ' WHERE';

      if (
        reqQuery.hasOwnProperty('min_employees') &&
        reqQuery.hasOwnProperty('min_employees')
      ) {
        if (reqQuery.min_employees > reqQuery.max_employees) {
          const err = new Error('the parameters are incorrect');
          err.status = 404;
          throw err;
        }
      }

      const dynamicArr = [];
      if (reqQuery.hasOwnProperty('search')) {
        dynamicArr.push(` handle LIKE $${counter}`);
        values.push(reqQuery.search);
        counter++;
      }
      if (reqQuery.hasOwnProperty('min_employees')) {
        dynamicArr.push(` num_employees > $${counter}`);
        values.push(reqQuery.min_employees);
        counter++;
      }
      if (reqQuery.hasOwnProperty('max_employees')) {
        dynamicArr.push(` num_employees < $${counter}`);
        values.push(reqQuery.max_employees);
        counter++;
      }
      queryString += dynamicArr.join(' AND');
    }

    const result = await db.query(queryString, values);
    return result.rows;
  }

  /** addCompany -- add new company
   * Sample companyData Input
    {
      handle: 'roni',
      name: 'Roni, Inc.',
      num_employees: 50,
      description: 'Amazing Cooking',
      logo_url: 'https://www.amazingcooking.com/logo.png'
    }
   */
  static async addCompany({
    handle,
    name,
    num_employees,
    description = '',
    logo_url = ''
  }) {
    try {
      const company = await db.query(
        'INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [handle, name, num_employees, description, logo_url]
      );
      return company.rows[0];
    } catch (err) {
      err.status = 422;
      throw err;
    }
  }
}

module.exports = Company;

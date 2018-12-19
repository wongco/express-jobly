// we need
const db = require('../db');

class Company {
  /** company -- returns
   *    {id, from_username, to_username, body, sent_at}
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
          err.status = 400;
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

    const result = db.query(queryString);
    return result.rows;
  }
}

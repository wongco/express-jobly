const db = require('../db');
const User = require('./User');

class Application {
  /** getApplications - get all jobs associated with user
   * input: username
   * output: [ { jobDetails }, ... ]
   */
  static async getApplications(username) {
    const jobs = await db.query(
      `SELECT title, salary, equity, company_handle, date_posted
    FROM users as u
    JOIN applications as a
    ON u.username = a.username
    JOIN jobs as j
    ON a.job_id = j.id
    WHERE u.username = $1`,
      [username]
    );

    return jobs.rows;
  }
}

module.exports = Application;

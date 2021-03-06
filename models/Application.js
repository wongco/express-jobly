const db = require('../db');
const User = require('./User');

class Application {
  /** getApplications - get all jobs associated with user
   * input: username
   * output: [ { jobDetails, applicationStatus }, ... ]
   */
  static async getApplications(username) {
    const jobs = await db.query(
      `SELECT title, salary, equity, company_handle, date_posted, state
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

  /** apply to job */
  static async applyJob(username, id, state) {
    const result = await db.query(
      `INSERT INTO applications (username, job_id, state) VALUES ($1, $2, $3) RETURNING *`,
      [username, id, state]
    );
    return result.rows[0];
  }
}

module.exports = Application;

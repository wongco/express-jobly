const db = require('../db'); //connect to db
const bcrypt = require('bcrypt');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const { BCRYPT_ROUNDS_OF_WORK } = require('../config');

class User {
  /** addUser -- add a new user
  input: { username, password, first_name, last_name, email, photo_url, is_admin }
  output: { username, password, first_name, last_name, email, photo_url, is_admin }
   */
  static async addUser({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url,
    is_admin
  }) {
    // checks if user exists, if not, throw error
    const results = await db.query('SELECT * FROM users WHERE username = $1', [
      username
    ]);

    // if user is already found, throw error
    if (results.rows.length > 0) {
      throw new Error('User already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS_OF_WORK);
    const user = await db.query(
      `INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        email,
        photo_url,
        is_admin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        username,
        hashedPassword,
        first_name,
        last_name,
        email,
        photo_url,
        is_admin
      ]
    );
    return user.rows[0];
  }

  /** getUsers -- get all users */
  static async getUsers() {
    const user = await db.query(`SELECT * FROM users`);
    return user.rows;
  }

  /** getUser -- get specific user */
  static async getUser(username) {
    const results = await db.query(
      'SELECT username, first_name, last_name, email, photo_url FROM users WHERE username = $1',
      [username]
    );

    // if user cannot be found, throw error
    if (results.rows.length === 0) {
      throw new Error('User does not exist.');
    }
    return results.rows[0];
  }

  /** patchUser -- update specific user details */
  static async patchUser(username, userDetails) {
    // check if user exists
    await User.getUser(username);

    const { query, values } = sqlForPartialUpdate(
      'users',
      userDetails,
      'username',
      username
    );

    const result = await db.query(query, values);
    const user = result.rows[0];
    return {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      photo_url: user.photo_url
    };
  }

  /** deleteUser -- delete a specific user */
  static async deleteUser(username, userDetails) {
    // check if user exists
    await User.getUser(username);

    const result = await db.query(
      `DELETE FROM users WHERE username = $1 RETURNING *`,
      [username]
    );
    return result.rows[0];
  }

  /** check User is valid */
  static async checkValidUser(username, inputPassword) {
    // check if user exists
    await User.getUser(username);

    const result = await db.query(
      'SELECT password FROM users WHERE username = $1',
      [username]
    );

    const { password } = result.rows[0];

    const isValid = await bcrypt.compare(inputPassword, password);
    if (!isValid) {
      throw new Error('Invalid Password');
    }
  }

  /** check User is Admin */
  static async isUserAdmin(username) {
    // check if user exists
    await User.getUser(username);

    const result = await db.query(
      'SELECT is_admin FROM users WHERE username = $1',
      [username]
    );

    const { is_admin } = result.rows[0];

    if (!is_admin) {
      throw new Error('Not Admin');
    }
  }
}

module.exports = User;

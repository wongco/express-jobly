const db = require('../db'); //connect to db
const bcrypt = require('bcrypt');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class User {
  /** addUser -- add a new user
  input: 
  {
    username: 'roni,
    password: '123456',
    first_name: 'roni',
    last_name: 'h,
    email: 'rh@abcdefg.com,
    photo_url: 'https://www.wow.com/pic.jpg,
    is_admin: true
  } =>
  output:
  {
    username: 'roni',
    password: 'ldask;fsadkfdfsafjljf;',
    first_name: 'roni',
    last_name: 'h,
    email: 'rh@abcdefg.com,
    photo_url: 'https://www.wow.com/pic.jpg,
    is_admin: true
  }
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
    // await User.getUser(username);

    const hashedPassword = await bcrypt.hash(password, 12);
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
}

module.exports = User;

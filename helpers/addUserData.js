const User = require('../models/User');
const db = require('../db');

async function setUp() {
  await db.query('DELETE FROM users');
  await User.addUser({
    username: 'roni',
    password: '123456',
    first_name: 'roni',
    last_name: 'h',
    email: 'rh@abcdefghijklmon.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: true
  });

  await User.addUser({
    username: 'gin',
    password: '123456',
    first_name: 'gin',
    last_name: 'w',
    email: 'gw@abcdefghijklmon.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: true
  });

  await User.addUser({
    username: 'joe',
    password: '123456',
    first_name: 'joe',
    last_name: 'a',
    email: 'ja@yay.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: false
  });

  await User.addUser({
    username: 'michael',
    password: '123456',
    first_name: 'mic',
    last_name: 'b',
    email: 'mb@ohno.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: false
  });
}

setUp();

module.exports = setUp;

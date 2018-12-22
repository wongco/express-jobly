/** Shared config for application; can be req'd many places. */

require('dotenv').config();

const SECRET = process.env.SECRET_KEY || 'test-use-env-key-in-production';
const BCRYPT_ROUNDS_OF_WORK = +process.env.BCRYPT_ROUNDS_OF_WORK || 12;
const PORT = +process.env.PORT || 3000;

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'jobly-test'
// - else: 'jobly'

let DB_URI;

if (process.env.NODE_ENV === 'test') {
  DB_URI = 'jobly-test';
} else {
  DB_URI = process.env.DATABASE_URL || 'jobly';
}

module.exports = {
  SECRET,
  PORT,
  DB_URI,
  BCRYPT_ROUNDS_OF_WORK
};

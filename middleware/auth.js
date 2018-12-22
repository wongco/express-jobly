const jwt = require('jsonwebtoken');
const { SECRET } = require('../config.js');
const User = require('../models/User');

/** Middleware: Requires user is logged in. */

function ensureLoggedIn(req, res, next) {
  try {
    const token = req.body._token || req.query._token;
    // verifies token and throws error if invalid
    jwt.verify(token, SECRET);
    return next();
  } catch (err) {
    return next({ status: 401, message: 'Unauthorized' });
  }
}

/** Middleware: Requires :username is logged in. */

function ensureCorrectUser(req, res, next) {
  try {
    const token = req.body._token || req.query._token;
    // verifies token and throws error if invalid
    const { username } = jwt.verify(token, SECRET);
    if (username === req.params.username) {
      return next();
    }
    throw new Error();
  } catch (err) {
    return next({ status: 401, message: 'Unauthorized' });
  }
}

/** Middleware: Requires admin is logged in. */

async function ensureAdminUser(req, res, next) {
  try {
    const token = req.body._token || req.query._token;
    // verifies token and throws error if invalid
    const { username } = jwt.verify(token, SECRET);
    // checks if user is admin or throws error
    await User.isUserAdmin(username);
    return next();
  } catch (err) {
    return next({ status: 401, message: 'Unauthorized' });
  }
}

module.exports = {
  ensureLoggedIn,
  ensureCorrectUser,
  ensureAdminUser
};

const express = require('express');
const router = new express.Router();
const jwt = require('jsonwebtoken');

// import config
const { SECRET } = require('../config');

// import model classes
const APIError = require('../models/ApiError');
const User = require('../models/User');

// import helper
const validateJSONSchema = require('../helpers/validateJSONSchema');

//json schema validation
const loginPostSchema = require('../schemas/loginPostSchema.json');

/** POST /companies - add company
 * output: { token: _token }
 **/
router.post('/login', async (req, res, next) => {
  try {
    // if schema is invalid, throw error
    validateJSONSchema(req.body, loginPostSchema);
  } catch (err) {
    return next(err);
  }

  try {
    const { username, password } = req.body;
    // if username or password is incorrect, will throwError
    await User.checkValidUser(username, password);
    const _token = jwt.sign({ username }, SECRET);
    return res.json({ token: _token });
  } catch (err) {
    let error;
    // logic to catch if user doesn't exist, throw generic error
    if (err.message === 'User does not exist.') {
      error = new APIError('Invalid Credentials', 422);
    } else if (err.message === 'Invalid Password') {
      error = new APIError('Invalid Credentials', 422);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

// exports router for app.js use
module.exports = router;

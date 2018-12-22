const express = require('express');
const jwt = require('jsonwebtoken');
const router = new express.Router();

// import config info
const { SECRET } = require('../config');

// import model classes
const User = require('../models/User');
const APIError = require('../models/ApiError');

// import middleware
const { ensureCorrectUser } = require('../middleware/auth');

// import helper
const removeToken = require('../helpers/removeToken');

//json schema for user post, patch
const { validate } = require('jsonschema');
const userPostSchema = require('../schemas/userPostSchema.json');
const userPatchSchema = require('../schemas/userPatchSchema.json');

/** POST /users - add new user
  input: { username, password, first_name, last_name, email, photo_url, is_admin }
  output: { username, password, first_name, last_name, email, photo_url, is_admin }
 */
router.post('/', async (req, res, next) => {
  const result = validate(req.body, userPostSchema);

  if (!result.valid) {
    // pass validation errors to error handler
    let message = result.errors.map(error => error.stack);
    let status = 400;
    let error = new APIError(message, status);
    return next(error);
  }

  try {
    // if user already exists, will throw error
    await User.addUser(req.body);
    const { username } = req.body;
    const token = jwt.sign({ username }, SECRET);
    return res.json({ token });
  } catch (err) {
    let error;
    if (err.message === 'User already exists.') {
      error = new APIError('Username is invalid. Choose a new username.', 400);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

/** GET /users - get all users
 * output: {users: [{username, first_name, last_name, email}, ...]}
 **/
router.get('/', async (req, res, next) => {
  try {
    const users = await User.getUsers();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /users/:username - get specific user details
 * input: _token (queryString)
 * output: {user: {username, first_name, last_name, email, photo_url}}
 **/
router.get('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.getUser(username);
    return res.json({ user });
  } catch (err) {
    let error;
    if (err.message === 'User does not exist.') {
      error = new APIError(err.message, 404);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

/** PATCH /users/:username - should update user's details
 * input: { _token, first_name, last_name, email, photo_url }
 * output: { user: { username, first_name, last_name, email, photo_url } }
 **/
router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
  const result = validate(req.body, userPatchSchema);
  if (!result.valid) {
    //pass validation errors to error handler
    let message = result.errors.map(err => err.stack);
    let status = 400;
    let error = new APIError(message, status);
    return next(error);
  }

  removeToken(req.body);

  try {
    const { username } = req.params;
    const user = await User.patchUser(username, req.body);
    return res.json({ user });
  } catch (err) {
    let error;
    if (err.message === 'User does not exist.') {
      error = new APIError(err.message, 404);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

/** DELETE /users/:username - should delete a user
 * input: { _token }
 * output: { message: "User deleted" }
 **/
router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.deleteUser(username);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    let error;
    if (err.message === 'User does not exist.') {
      error = new APIError(err.message, 404);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

// exports router for app.js use
module.exports = router;

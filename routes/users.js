const express = require('express');
const router = new express.Router();
const User = require('../models/User');
const APIError = require('../models/ApiError');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');

//json schema dor user post, patch
const { validate } = require('jsonschema');
const userPostSchema = require('../schemas/userPostSchema.json');
const userPatchSchema = require('../schemas/userPatchSchema.json');
/** POST /users - add new user
 * input:
{
  username: 'roni,
  password: '123456',
  first_name: 'roni',
  last_name: 'h,
  email: 'rh@abcdefg.com,
  photo_url: 'https://www.wow.com/pic.jpg,
  is_admin: true
}
 * output:
{
  "user": {
    username: 'roni,
    password: '123456',
    first_name: 'roni',
    last_name: 'h,
    email: 'rh@abcdefg.com,
    photo_url: 'https://www.wow.com/pic.jpg,
    is_admin: true
}
}
 **/
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
    await User.addUser(req.body);
    const { username } = req.body;
    const token = jwt.sign({ username }, SECRET);
    return res.json({ token });
  } catch (err) {
    return next(err);
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
    // let error;
    // if (err.message === 'Company not found.') {
    //   error = new APIError(err.message, 400);
    // } else {
    //   error = Error('Server error occured.');
    // }
    // return next(error);
    return next(err);
  }
});

/** GET /users/:username - get specific user details
 * output: {user: {username, first_name, last_name, email, photo_url}}
 **/
router.get('/:username', async (req, res, next) => {
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
    // return next(err);
  }
});

/** PATCH /users/:username - should update user's details
 * input:
{
  first_name: 'roni',
  last_name: 'h,
  email: 'rh@abcdefg.com,
  photo_url: 'https://www.wow.com/pic.jpg,
}
 * output: {user: {username, first_name, last_name, email, photo_url}}
 **/
router.patch('/:username', async (req, res, next) => {
  const result = validate(req.body, userPatchSchema);
  if (!result.valid) {
    //pass validation errors to error handler
    let message = result.errors.map(err => err.stack);
    let status = 400;
    let error = new APIError(message, status);
    return next(error);
  }

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

 * output: { message: "User deleted" }
 **/
router.delete('/:username', async (req, res, next) => {
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

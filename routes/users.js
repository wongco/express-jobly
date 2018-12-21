const express = require('express');
const router = new express.Router();
const User = require('../models/User');
const APIError = require('../models/ApiError');

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
  try {
    const user = await User.addUser(req.body);
    return res.json({ user });
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

// exports router for app.js use
module.exports = router;

const express = require('express');
const router = new express.Router();
const Job = require('../models/Job');
const APIError = require('../models/ApiError');

router.post('/', async (req, res, next) => {
  // use the create job method to here
  try {
    const job = Job.addAJob(req.body);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});
module.exports = router;

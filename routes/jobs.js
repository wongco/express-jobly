const express = require('express');
const router = new express.Router();
const Job = require('../models/Job');
const APIError = require('../models/ApiError');

router.post('/', async (req, res, next) => {
  // use the create job method to here
  try {
    const job = await Job.addJob(req.body);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  // use the create job method to here
  try {
    const jobs = await Job.getJobs(req.query);
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

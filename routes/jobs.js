const express = require('express');
const router = new express.Router();
const Job = require('../models/Job');
const APIError = require('../models/ApiError');

/** POST /jobs - add new job
 * input:
{
  title: "CEO",
  salary: 5000000,
  equity: 0.25,
  company_handle: 'roni',
}
 * output:
{
  "job": {
    "id": 7,
    "title": "Coffee Maker",
    "salary": 5000,
    "equity": 0.01,
    "company_handle": "apple",
    "date_posted": "2018-12-20T08:00:00.000Z"
  }
}
 **/
router.post('/', async (req, res, next) => {
  try {
    const job = await Job.addJob(req.body);
    return res.json({ job });
  } catch (err) {
    let error;
    if (err.message === 'Company not found.') {
      error = new APIError(err.message, 400);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

/** GET /jobs - get detail of multiple jobs
input from req.query
{
  search,
  min_salary,
  min_equity 
}
 *
 * => {jobs: [jobsData, ...]}
 **/
router.get('/', async (req, res, next) => {
  try {
    const jobs = await Job.getJobs(req.query);
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

/** GET /jobs/:id - get detail of specific job
 *
 * => {jobs: {jobData}}
 **/
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.getJob(+id);
    return res.json({ job });
  } catch (err) {
    let error;
    if (err.message === 'Job not found.') {
      error = new APIError(err.message, 404);
    } else if (err.message === 'invalid input syntax for integer: "NaN"') {
      error = new APIError('Please provide a valid job ID.', 422);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

/** PATCH /jobs/:id - get detail of specific job
 *
 * => {jobs: {jobData}}
 **/
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.patchJob(+id, req.body);
    return res.json({ job });
  } catch (err) {
    let error;
    if (err.message === 'Job not found.') {
      error = new APIError(err.message, 404);
    } else if (err.message === 'invalid input syntax for integer: "NaN"') {
      error = new APIError('Please provide a valid job ID.', 422);
    } else if (err.message === 'Company not found.') {
      error = new APIError(err.message, 404);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

/** DELETE /jobs/:id - delete specific job
 *
 * => {message: "Job deleted"}
 **/
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.deleteJob(+id);
    return res.json({ message: 'Job deleted' });
  } catch (err) {
    let error;
    if (err.message === 'Job not found.') {
      error = new APIError(err.message, 404);
    } else if (err.message === 'invalid input syntax for integer: "NaN"') {
      error = new APIError('Please provide a valid job ID.', 422);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

module.exports = router;

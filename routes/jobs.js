const express = require('express');
const router = new express.Router();

// import model classes
const Job = require('../models/Job');
const APIError = require('../models/ApiError');

// import middleware
const { ensureLoggedIn, ensureAdminUser } = require('../middleware/auth');

// import helper
const removeToken = require('../helpers/removeToken');

//json schema for company post
const { validate } = require('jsonschema');
const jobPostSchema = require('../schemas/jobPostSchema.json');
const jobPatchSchema = require('../schemas/jobPatchSchema.json');

/** POST /jobs - add new job
 * input:{ _token, title, salary, equity, company_handle }
 * output: { job: {jobDetails } }
 **/
router.post('/', ensureAdminUser, async (req, res, next) => {
  // validateJSONSchema(req.body, jobPostSchema);
  const result = validate(req.body, jobPostSchema);
  if (!result.valid) {
    // pass validation errors to error handler
    let message = result.errors.map(error => error.stack);
    let status = 400;
    let error = new APIError(message, status);
    return next(error);
  }

  removeToken(req.body);

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
 * input: _token (queryString)
 *      optional - { search, min_salary, min_equity }
 * output: { jobs: [ {jobDetail }, ...] }
 **/
router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const jobs = await Job.getJobs(req.query);
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

/** GET /jobs/:id - get detail of specific job
 * input: _token (queryString)
 * output: { jobs: { jobData } }
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
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
 * input: { _token }
 * output: { jobs: { jobData } }
 **/
router.patch('/:id', ensureAdminUser, async (req, res, next) => {
  const result = validate(req.body, jobPatchSchema);

  if (!result.valid) {
    // pass validation errors to error handler
    let message = result.errors.map(error => error.stack);
    let status = 400;
    let error = new APIError(message, status);
    return next(error);
  }

  removeToken(req.body);

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
 * input: { _token }
 * output: {message: "Job deleted"}
 **/
router.delete('/:id', ensureAdminUser, async (req, res, next) => {
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

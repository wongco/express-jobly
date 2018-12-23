const express = require('express');
const router = new express.Router();

// import model classes
const Application = require('../models/Application');
const Job = require('../models/Job');
const APIError = require('../models/ApiError');

// import middleware
const { ensureLoggedIn, ensureAdminUser } = require('../middleware/auth');

// import helper
const removeToken = require('../helpers/removeToken');
const validateJSONSchema = require('../helpers/validateJSONSchema');

//json schema validation
const jobPostSchema = require('../schemas/jobPostSchema.json');
const jobPatchSchema = require('../schemas/jobPatchSchema.json');
const applyJobSchema = require('../schemas/applyJobSchema.json');

/** POST /jobs - add new job
 * input:{ _token, title, salary, equity, company_handle }
 * output: { job: {jobDetails } }
 **/
router.post('/', ensureAdminUser, async (req, res, next) => {
  try {
    // if schema is invalid, throw error
    validateJSONSchema(req.body, jobPostSchema);
  } catch (err) {
    return next(err);
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
  try {
    // if schema is invalid, throw error
    validateJSONSchema(req.body, jobPatchSchema);
  } catch (err) {
    return next(err);
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

/** POST /jobs/:id/apply - apply to a specific job by current user
 * input: { _token, state }
 * output: { message: new-state }
 */

router.post('/:id/apply', ensureLoggedIn, async (req, res, next) => {
  try {
    // if schema is invalid, throw error
    validateJSONSchema(req.body, applyJobSchema);
  } catch (err) {
    return next(err);
  }

  removeToken();

  try {
    const { id } = req.params;
    // check if job exists first, if not, throw error
    await Job.getJob(id);

    // username will be verified by the time we get here due to middleware
    const { username } = req;
    const { state } = req.body;
    const job = await Application.applyJob(username, id, state);
    return res.json({ message: job.state });
  } catch (err) {
    let error;
    if (err.message === 'Job not found.') {
      error = new APIError(err.message, 404);
    } else if (err.message.includes('invalid input value for enum state')) {
      error = new APIError('Invalid state. Check your input.', 422);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

module.exports = router;

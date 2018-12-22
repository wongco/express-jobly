const express = require('express');
const router = new express.Router();

// import model classes
const Company = require('../models/Company');
const Job = require('../models/Job');
const APIError = require('../models/ApiError');

// import middlware
const { ensureLoggedIn, ensureAdminUser } = require('../middleware/auth');

// import helper
const removeToken = require('../helpers/removeToken');

//json schema for company post
const { validate } = require('jsonschema');
const companyPostSchema = require('../schemas/companyPostSchema.json');
const companyPatchSchema = require('../schemas/companyPatchSchema.json');

/** GET /companies - get detail of companies
 * input: _token (queryString)
 *    Note: optional - { search, min_employees, max_employees }
 * output: { companies: [ { companyData }, ...] }
 **/
router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const companies = await Company.getCompanies(req.query);
    return res.json({ companies });
  } catch (err) {
    let error;
    if (err.message === 'Check that your parameters are correct.') {
      error = new APIError(err.message, 400);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

/** POST /companies - add company
 * input: { _token, handle, name, num_employees, description, logo_url }
 *    note: num_employees, description, logo_url optional
 * output: { company: { companyData } }
 **/
router.post('/', ensureAdminUser, async (req, res, next) => {
  const result = validate(req.body, companyPostSchema);

  if (!result.valid) {
    let message = result.errors.map(error => error.stack);
    let status = 400;
    let error = new APIError(message, status);
    return next(error);
  }

  removeToken(req.body);

  try {
    const company = await Company.addCompany(req.body);
    return res.json({ company });
  } catch (err) {
    let error;
    if (err.message === 'Company already exists.') {
      error = new APIError(`${req.body.handle} already exists.`, 409);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

/** GET /companies/:handle - get detail of specific company
 * input: _token (queryString)
 * output: { company: { companyData,..., jobs: [ { jobDetail }, ...] } }
 **/
router.get('/:handle', ensureLoggedIn, async (req, res, next) => {
  try {
    const { handle } = req.params;

    const company = await Company.getCompany(handle);
    const jobs = await Job.getJobs({ search: company.handle });
    company.jobs = jobs;
    return res.json({ company });
  } catch (err) {
    let error;
    if (err.message === 'Company not found.') {
      error = new APIError(err.message, 404);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

/** PATCH /companies/:handle - update details of company
 * input: { _token, name, num_employees, description, logo_url }
 * output: { company: { companyData } }
 **/
router.patch('/:handle', ensureAdminUser, async (req, res, next) => {
  const result = validate(req.body, companyPatchSchema);

  if (!result.valid) {
    // pass validation errors to error handler
    //  (the "stack" key is generally the most useful)
    let message = result.errors.map(error => error.stack);
    let status = 400;
    let error = new APIError(message, status);
    return next(error);
  }

  removeToken();

  try {
    const handle = req.params.handle;
    const company = await Company.patchCompany(handle, req.body);
    return res.json({ company });
  } catch (err) {
    let error;
    if (err.message === 'Company not found.') {
      error = new APIError(err.message, 404);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

/** DELETE /companies/:handle - delete company
 * input: { _token }
 * output: { message: 'Company deleted' }
 */
router.delete('/:handle', ensureAdminUser, async (req, res, next) => {
  try {
    const handle = req.params.handle;
    await Company.deleteCompany(handle);
    return res.json({ message: 'Company deleted' });
  } catch (err) {
    let error;
    if (err.message === 'Company not found.') {
      error = new APIError(err.message, 404);
    } else {
      error = Error('Server error occured.');
    }
    return next(error);
  }
});

// exports router for app.js use
module.exports = router;

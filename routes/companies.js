const express = require('express');
const router = new express.Router();
const Company = require('../models/Company');
const APIError = require('../models/ApiError');

//json schema for company post
const { validate } = require('jsonschema');
const companyPostSchema = require('../schemas/companyPostSchema.json');
const companyPatchSchema = require('../schemas/companyPatchSchema.json');

/** GET /companies - get detail of companies
 * request query input parameters (optional):
 * {
 *   search,
 *   min_employees,
 *   max_employees
 * }
 *
 * => {companies: [companyData, ...]}
 **/
router.get('/', async (req, res, next) => {
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
 * request body input parameters (employees, desc, logo_url optional):
 {
   "handle": "apple",
   "name": "Apple Inc",
   "num_employees": 300,
   "description": "Amazing Cooking",
   "logo_url": "https://www.amazingcooking.com/logo.png"
 }
 *
 * => {company: {companyData}}
 **/
router.post('/', async (req, res, next) => {
  const result = validate(req.body, companyPostSchema);

  if (!result.valid) {
    // pass validation errors to error handler
    //  (the "stack" key is generally the most useful)
    let message = result.errors.map(error => error.stack);
    let status = 400;
    let error = new APIError(message, status);
    return next(error);
  }

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
 *
 * => {company: {companyData}}
 **/
router.get('/:handle', async (req, res, next) => {
  try {
    const handle = req.params.handle;
    const company = await Company.getCompany(handle);
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
 request body input:
 {
   "name": "Apple Inc",
   "num_employees": 300,
   "description": "Amazing Cooking",
   "logo_url": "https://www.amazingcooking.com/logo.png"
 }
 output: => {company: {companyData}}
 **/
router.patch('/:handle', async (req, res, next) => {
  const result = validate(req.body, companyPatchSchema);

  if (!result.valid) {
    // pass validation errors to error handler
    //  (the "stack" key is generally the most useful)
    let message = result.errors.map(error => error.stack);
    let status = 400;
    let error = new APIError(message, status);
    return next(error);
  }

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
input: handle (parameter)
 **/
router.delete('/:handle', async (req, res, next) => {
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

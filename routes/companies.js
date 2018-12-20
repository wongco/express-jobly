const express = require('express');
const router = new express.Router();
const Company = require('../models/Company');

/** GET /companies - get detail of companies
 * query parameters (optional):
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
    return next(err);
  }
});

/** POST /companies - get detail of companies
 * post body parameters (employees, desc, logo_url optional):
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
  try {
    const company = await Company.addCompany(req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /companies/:handle - get detail of companies
 *
 *
 * => {company: {companyData}}
 **/
router.get('/:handle', async (req, res, next) => {
  try {
    const search = req.params.handle;
    const company = await Company.getCompany(search);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

// exports router for app.js use
module.exports = router;

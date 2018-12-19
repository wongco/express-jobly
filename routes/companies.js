const express = require('express');
const router = new express.Router();
const Company = require('../models/Company');

/** default get on route */
router.get('/', async (req, res, next) => {
  //get the query obj
  // const { search, min_employees, max_employees } = req.query;
  // Company.getCompany going to handle everything in the model
  const results = await Company.getCompany(req.query);
  res.json(results);
});

// exports router for app.js use
module.exports = router;

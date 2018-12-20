/** Express app for jobly. */

const express = require('express');
const app = express();
app.use(express.json()); // middleware to parse json, so express can read json
const APIError = require('./models/ApiError');

// add logging system
const morgan = require('morgan');
app.use(morgan('tiny'));

// import routes
const companiesRoutes = require('./routes/companies');
app.use('/companies', companiesRoutes);

/** 404 handler */
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */
// global error handler
app.use(function(err, req, res, next) {
  // all errors that get to here get coerced into API Errors
  if (!(err instanceof APIError)) {
    err = new APIError(err.message, err.status);
  }

  // Custom Error Message for 422
  // if (err.status === 422) {
  //   err.message = 'Error. Check your inputs.';
  // }

  return res.status(err.status).json(err);
});

module.exports = app;

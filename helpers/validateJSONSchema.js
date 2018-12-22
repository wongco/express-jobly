const { validate } = require('jsonschema');
const APIError = require('../models/ApiError');

function validateJSONSchema(reqData, schema) {
  const result = validate(reqData, schema);

  if (!result.valid) {
    // pass validation errors to error handler
    let message = result.errors.map(error => error.stack);
    let status = 400;
    let error = new APIError(message, status);
    throw error;
  }
}

module.exports = validateJSONSchema;

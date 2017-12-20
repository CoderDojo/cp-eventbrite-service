const Joi = require('joi');

module.exports = () => ({
  // TODO : alternatives is buggy? ask @daniel, both must be required
  id: Joi.string(),

  url: Joi.string(),
  token: Joi.string().required(),
});

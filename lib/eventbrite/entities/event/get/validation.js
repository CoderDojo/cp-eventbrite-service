var Joi = require('joi');
module.exports = function (definition) {
  return {
    id: Joi.string(), // TODO : alternatives is buggy? ask @daniel, both must be required
    url: Joi.string(),
    token: Joi.string().required()
  };
};

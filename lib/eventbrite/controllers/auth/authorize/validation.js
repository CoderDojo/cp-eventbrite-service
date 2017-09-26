const Joi = require('joi');

module.exports = () => ({
  dojoId: Joi.string().required(),
  code: Joi.string().required(),
});

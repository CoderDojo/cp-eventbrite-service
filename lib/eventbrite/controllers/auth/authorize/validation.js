const Joi = require('joi');

module.exports = () => ({
  dojoId: Joi.string().guid().required(),
  code: Joi.string().required(),
  userToken: Joi.string().required(),
  orgId: Joi.string().required(),
});

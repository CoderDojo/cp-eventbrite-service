const Joi = require('joi');

module.exports = () => ({
  code: Joi.string().required(),
});

var Joi = require('joi');
module.exports = function (definition) {
  return {
    dojoId: Joi.string().required(),
    code: Joi.string().required()
  };
};

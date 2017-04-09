var Joi = require('joi');
var _ = require('lodash');
module.exports = function (definition) {
  return _.extend(require('../handlers/validation'), {dojo: Joi.object().required()});
};

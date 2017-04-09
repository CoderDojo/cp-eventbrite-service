var Joi = require('joi');
module.exports = function (definition) {
  return {
    id: definition.id.required(),
    token: definition.token.required()
  };
};

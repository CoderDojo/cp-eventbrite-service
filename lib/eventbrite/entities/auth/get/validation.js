var Joi = require('joi');
module.exports = function (definition) {
  return {
    pubKey: definition.pubKey.required(),
    secKey: definition.secKey.required(),
    code: definition.code.required()
  };
};

var Joi = require('joi');

module.exports = function () {
  var seneca = this;
  var name = 'auth';
  var domain = 'cd-eventbrite';

  var definition = {
    code: Joi.string(),
    secKey: Joi.string(),
    pubKey: Joi.string()
  };

  return {
    name: name,
    domain: domain,
    definition: definition,
    // RO support atm
    acts: {
      get: {
        validation: require('./get/validation')(definition),
        cb: require('./get').bind(this)()
      }
    }
  };
};

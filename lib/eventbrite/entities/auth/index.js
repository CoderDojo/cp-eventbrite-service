const Joi = require('joi');
const validation = require('./get/validation');
const get = require('./get');

module.exports = function auth() {
  const name = 'auth';
  const domain = 'cd-eventbrite';

  const definition = {
    code: Joi.string(),
    secKey: Joi.string(),
    pubKey: Joi.string(),
  };

  return {
    name,
    domain,
    definition,
    // RO support atm
    acts: {
      get: {
        validation: validation(definition),
        cb: get.bind(this)(),
      },
    },
  };
};

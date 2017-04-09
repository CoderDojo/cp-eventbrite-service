var Joi = require('joi');

module.exports = function () {
  var seneca = this;
  var name = 'webhook';
  var domain = 'cd-eventbrite';
  seneca.context.API_BASE = 'https://www.eventbriteapi.com/v3';

  var definition = {
    id: Joi.string().required(),
    endpoint_url: Joi.string().required(),
    actions: Joi.string().required(),
    event_id: Joi.string().required(),
    token: Joi.string().required()
  };

  return {
    name: name,
    domain: domain,
    definition: definition,
    // RO support atm
    acts: {
      create: {
        validation: require('./create/validation')(definition),
        cb: require('./create').bind(this)()
      },
      delete: {
        validation: require('./delete/validation')(definition),
        cb: require('./delete').bind(this)()
      }
    }
  };
};

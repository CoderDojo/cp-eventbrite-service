var Joi = require('joi');

module.exports = function () {
  var seneca = this;
  var name = 'event';
  var domain = 'cd-eventbrite';
  seneca.context.API_BASE = 'https://www.eventbriteapi.com/v3';
  var definition = {
    
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

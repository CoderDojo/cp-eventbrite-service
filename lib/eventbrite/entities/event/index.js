const validation = require('./get/validation');
const get = require('./get');

module.exports = function event() {
  const seneca = this;
  const name = 'event';
  const domain = 'cd-eventbrite';
  seneca.context.API_BASE = 'https://www.eventbriteapi.com/v3';
  const definition = {};

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

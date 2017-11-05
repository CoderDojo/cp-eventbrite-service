var Joi = require('joi');

module.exports = function () {
  var seneca = this;
  var name = 'webhook';
  var domain = 'cd-eventbrite';
  var plugin = 'cd-integration';

  var definition = {
  };

  return {
    name: name,
    plugin: plugin,
    domain: domain,
    definition: definition,
    // RO support atm
    acts: {
      handlers: {
        validation: require('./handlers/validation')(definition),
        cb: require('./handlers').bind(this)()
      },
      eventHandler: {
        validation: require('./eventHandler/validation')(definition),
        cb: require('./eventHandler').bind(this)()
      },
      unimplementHandler: {
        validation: require('./unimplementedHandler/validation')(definition),
        cb: require('./unimplementedHandler').bind(this)()
      }
    }
  };
};

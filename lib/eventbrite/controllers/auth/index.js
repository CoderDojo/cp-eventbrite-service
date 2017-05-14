var Joi = require('joi');

module.exports = function () {
  var seneca = this;
  var name = 'auth';
  var domain = 'cd-eventbrite';
  var plugin = 'cd-auth';
  seneca.context.TRANSPARENT = false;

  var definition = {
  };

  return {
    name: name,
    plugin: plugin,
    domain: domain,
    definition: definition,
    acts: {
      authorize: {
        validation: require('./authorize/validation')(definition),
        cb: require('./authorize').bind(this)()
      },
      deauthorize: {
        validation: require('./deauthorize/validation')(definition),
        cb: require('./deauthorize').bind(this)()
      },
      getApp: {
        validation: require('./app/validation')(definition),
        cb: require('./app').bind(this)()
      }
    }
  };
};

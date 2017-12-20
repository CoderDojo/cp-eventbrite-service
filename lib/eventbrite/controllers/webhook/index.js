const handlerVal = require('./handlers/validation');
const handler = require('./handlers');
const eventHandlerVal = require('./eventHandler/validation');
const eventHandler = require('./eventHandler');
const unimplementHandlerVal = require('./unimplementedHandler/validation');
const unimplementHandler = require('./unimplementedHandler');

module.exports = function webhook() {
  const name = 'webhook';
  const domain = 'cd-eventbrite';
  const plugin = 'cd-integration';

  const definition = {};

  return {
    name,
    plugin,
    domain,
    definition,
    // RO support atm
    acts: {
      handlers: {
        validation: handlerVal(definition),
        cb: handler.bind(this)(),
      },
      eventHandler: {
        validation: eventHandlerVal(definition),
        cb: eventHandler.bind(this)(),
      },
      unimplementHandler: {
        validation: unimplementHandlerVal(definition),
        cb: unimplementHandler.bind(this)(),
      },
    },
  };
};

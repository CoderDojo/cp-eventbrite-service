const _ = require('lodash');
const { promisify } = require('bluebird');
const authController = require('./lib/eventbrite/controllers/auth');
const webhookController = require('./lib/eventbrite/controllers/webhook');
const authEntity = require('./lib/eventbrite/entities/auth');
const eventEntity = require('./lib/eventbrite/entities/event');
const webhookEntity = require('./lib/eventbrite/entities/webhook');
const ping = require('./lib/ping');

module.exports = function cdEventbrite() {
  // https://github.com/senecajs/seneca/issues/112
  const seneca = this.root;
  const auth = authEntity.bind(seneca)();
  const event = eventEntity.bind(seneca)();
  const webhook = webhookEntity.bind(seneca)();
  const acts = {};
  const plugin = 'cd-eventbrite';
  const senecaActP = promisify(seneca.act, { context: seneca });

  function keyCb(entityName, key) {
    return args => senecaActP(
      _.extend({
        role: plugin,
        entity: entityName,
        cmd: key,
      }, args),
    );
  }

  // Load primitives
  [auth, event, webhook].forEach((entity) => {
    acts[entity.name] = {};
    Object.entries(entity.acts).forEach(([key, { validation, cb }]) => {
      const act = _.extend({
        role: plugin,
        entity: entity.name,
        cmd: key,
      }, validation);
      seneca.add(act, cb);
      // Add a promise shortcut for controllers
      acts[entity.name][key] = keyCb(entity.name, key);
      seneca.log.debug(`added act role:${entity.name} cmd:${key}`);
    });
  });

  // Load controllers
  const ctrls = {
    auth: authController.bind(seneca)(),
    webhook: webhookController.bind(seneca)(),
  };
  _.each(ctrls, (ctrl, entity) => {
    Object.entries(ctrl.acts).forEach(([key, { validation, cb }]) => {
      const act = _.extend({
        role: plugin,
        ctrl: entity,
        cmd: key,
      }, validation);
      seneca.add(act, cb);
      seneca.log.info('added act', act, { joi$: validation });
      /*
       * No promise are added, we shouldn't have to reuse the same function twice.
       * If we do, create an utility
       */
    });
  });

  // Load utilities
  seneca.add({ role: plugin, cmd: 'ping' }, ping);

  return {
    name: plugin,
    exportmap: {
      acts,
    },
  };
};

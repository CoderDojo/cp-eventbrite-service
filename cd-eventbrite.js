var _ = require('lodash');
var Promise = require('bluebird');
module.exports = function () {
  // https://github.com/senecajs/seneca/issues/112
  var seneca = this.root;
  var auth = require('./lib/eventbrite/entities/auth').bind(seneca)();
  var event = require('./lib/eventbrite/entities/event').bind(seneca)();
  var webhook = require('./lib/eventbrite/entities/webhook').bind(seneca)();
  var acts = {};
  var plugin = 'cd-eventbrite';
  var senecaActP = Promise.promisify(seneca.act, {context: seneca});

  var keyCb = function (entityName, key) {
    return function (args) {
      return senecaActP(_.extend({
        role: plugin,
        entity: entityName,
        cmd: key
      }, args));
    };
  };

  // Load primitives
  [auth, event, webhook].forEach(function (entity) {
    acts[entity.name] = {};
    for (var key in entity.acts) {
      var act = _.extend({
        role: plugin,
        entity: entity.name,
        cmd: key
      }, entity.acts[key].validation);
      seneca.add(act, entity.acts[key].cb);
      // Add a promise shortcut for controllers
      acts[entity.name][key] = keyCb(entity.name, key);
      seneca.log.debug('added act role:' + entity.name + ' cmd:' + key);
    }
  });

  // Load controllers
  var ctrls = {};
  ctrls['auth'] = require('./lib/eventbrite/controllers/auth/index').bind(seneca)();
  ctrls['webhook'] = require('./lib/eventbrite/controllers/webhook/index').bind(seneca)();
  _.each(ctrls, function (ctrl, entity) {
    for (var key in ctrl.acts) {
      var act = _.extend({
        role: plugin,
        ctrl: entity,
        cmd: key
      }, ctrl.acts[key].validation);
      seneca.add(act, ctrl.acts[key].cb);
      seneca.log.info('added act', act, {joi$: ctrl.acts[key].validation});
      // No promise are added, we shouldn't have to reuse the same function twice. If we do, create an utility
    }
  });

  // Load utilities
  // -> none atm

  return {
    name: plugin,
    exportmap: {
      acts: acts
    }
  };
};

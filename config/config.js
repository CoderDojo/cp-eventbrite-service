var decamelize = require('decamelize');
var camelize = require('camelcase');

module.exports = function (options) {
  return {
    transport: {
      type: 'web',
      web: {
        timeout: 120000,
        port: options && options.port ? options.port : 10307
      }
    },
    default_plugins: {web: false}, // seneca-web is crashing on startup ?
    legacy: {error_codes: false, validate: false}, // needed if using Seneca 2.x
    timeout: 120000,
    strict: { add: false, result: false },
    actcache: { active: false }
  };
};

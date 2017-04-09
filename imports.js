var _ = require('lodash');
var path = require('path');
module.exports = function (configOverride) {
  var config = require('./config/config.js')();
  var log = require('cp-logs-lib')({name: 'cp-eventbrite', level: 'warn'});
  config.log = log.log;
  var seneca = require('seneca')(_.extend(config, configOverride));
  seneca.use(require('seneca-entity'))
  .use(require('seneca-basic'))
  .use(require('seneca-joi'));
  seneca.use('./cd-eventbrite', {});
  seneca.use(require('cp-permissions-plugin'), {
    config: path.resolve(__dirname + '/lib/eventbrite/controllers/perm') });
  return seneca;
};

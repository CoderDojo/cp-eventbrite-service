const _ = require('lodash');
const path = require('path');
const config = require('./config/config.js');
const log = require('cp-logs-lib')({ name: 'cp-eventbrite', level: 'warn' });
const seneca = require('seneca');
const senecaEntity = require('seneca-entity');
const senecaBasic = require('seneca-basic');
const senecaJoi = require('seneca-joi');
const cpPerm = require('cp-permissions-plugin');

module.exports = (configOverride) => {
  config();
  config.log = log.log;
  const server = seneca(_.extend(config, configOverride));
  server.use(senecaEntity).use(senecaBasic).use(senecaJoi);
  server.use('./cd-eventbrite', {});
  server.use(cpPerm, {
    config: path.resolve(`${__dirname}/lib/eventbrite/controllers/perm`),
  });
  return server;
};

const _ = require('lodash');
const path = require('path');
const config = require('./config/config.js')();
const cpLogs = require('cp-logs-lib');
const cpPerm = require('cp-permissions-plugin');
const seneca = require('seneca');
const senecaEntity = require('seneca-entity');
const senecaBasic = require('seneca-basic');
const senecaJoi = require('seneca-joi');
const { promisify } = require('bluebird');

module.exports = (configOverride) => {
  const log = cpLogs({ name: 'cp-eventbrite', level: 'warn' });
  config.log = log.log;
  const server = seneca(_.extend(config, configOverride));
  server.actAsync = promisify(server.act, { context: server });
  server.use(senecaEntity)
    .use(senecaBasic)
    .use(senecaJoi);
  server.use('./cd-eventbrite', {});
  server.use(cpPerm, {
    config: path.resolve(`${__dirname}/lib/eventbrite/controllers/perm`),
  });

  return server;
};

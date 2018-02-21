/* eslint-disable no-console */
const newrelic = process.env.NEW_RELIC_ENABLED === 'true' ? require('newrelic') : undefined;
const senecaNewRelic = require('seneca-newrelic');
const config = require('./config/config.js')();
const seneca = require('./imports')(config);
const util = require('util');
const { isUndefined } = require('lodash');

const service = 'cp-eventbrite-service';
if (!isUndefined(newrelic)) {
  seneca.use(senecaNewRelic, {
    newrelic,
    roles: ['cd-eventbrite'],
    filter(p) {
      p.user = p.user ? p.user.id : undefined;
      p.login = p.login ? p.login.id : undefined;
      return p;
    },
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', shutdown);
process.on('SIGUSR2', shutdown);

function shutdown(err) {
  if (err !== undefined) {
    const error = {
      date: new Date().toString(),
      msg:
        err.stack !== undefined
          ? `FATAL: UncaughtException, please report: ${util.inspect(err.stack)}`
          : 'FATAL: UncaughtException, no stack trace',
      err: util.inspect(err),
    };
    console.error(JSON.stringify(error));
    process.exit(1);
  }
  process.exit(0);
}

require('./network')(seneca);

seneca.ready(() => {
  console.log(`${service} running`);
});

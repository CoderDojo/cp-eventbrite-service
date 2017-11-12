/* eslint-disable no-console */
const service = 'cp-eventbrite-service';
const config = require('./config/config.js')();
const seneca = require('./imports')(config);
const util = require('util');

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', shutdown);
process.on('SIGUSR2', shutdown);

function shutdown(err) {
  if (err !== undefined && err.stack !== undefined) {
    console.error(
      `${new Date().toString()} FATAL: UncaughtException, please report: ${util.inspect(err)}`,
    );
    console.error(util.inspect(err.stack));
    console.trace();
  }
  process.exit(0);
}

require('./network')(seneca);

seneca.ready(() => {
  console.log(`${service} running`);
});

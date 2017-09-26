/* eslint-disable no-console */
const service = 'cp-dojos-service';
const config = require('./config/config.js')();
const seneca = require('./imports')(config);
const util = require('util');
const dgram = require('dgram');

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
  const message = new Buffer(service);

  const client = dgram.createSocket('udp4');
  client.send(message, 0, message.length, 11404, 'localhost', (err) => {
    if (err) {
      console.error(err);
      process.exit(-1);
    }
    client.close();
  });
});

var service = 'cp-dojos-service';
var config = require('./config/config.js')();
var seneca = require('./imports')(config);
var util = require('util');
var dgram = require('dgram');

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', shutdown);
process.on('SIGUSR2', shutdown)

function shutdown (err) {
  if (err !== void 0 && err.stack !== void 0) {
    console.error(new Date().toString() + ' FATAL: UncaughtException, please report: ' + util.inspect(err));
    console.error(util.inspect(err.stack));
    console.trace();
  }
  process.exit(0);
}

require('./network')(seneca);

seneca.ready(function () {
  var message = new Buffer(service);

  var client = dgram.createSocket('udp4');
  client.send(message, 0, message.length, 11404, 'localhost', function (err, bytes) {
    if (err) {
      console.error(err);
      process.exit(-1);
    }
    client.close();
  });
});

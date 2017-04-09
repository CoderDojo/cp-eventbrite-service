var service = 'cp-dojos-service';
var config = require('./config/config.js')();
var seneca = require('./imports')(config);
var util = require('util');
var heapdump = require('heapdump');
var dgram = require('dgram');

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', shutdown);

function shutdown (err) {
  if (err !== void 0 && err.stack !== void 0) {
    console.error(new Date().toString() + ' FATAL: UncaughtException, please report: ' + util.inspect(err));
    console.error(util.inspect(err.stack));
    console.trace();
  }
  process.exit(0);
}

process.on('SIGUSR2', function () {
  var snapshot = '/tmp/cp-eventbrite-service-' + Date.now() + '.heapsnapshot';
  console.log('Got SIGUSR2, creating heap snapshot: ', snapshot);
  heapdump.writeSnapshot(snapshot, function (err, filename) {
    if (err) console.error('Error creating snapshot:', err);
    console.log('dump written to', filename);
  });
});

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

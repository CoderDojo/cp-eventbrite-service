var request = require('request');
module.exports = function () {
  return function (args, cb) {
    request.post('https://www.eventbrite.com/oauth/token',
      {
        form: {
          code: args.code,
          client_secret: args.secKey,
          client_id: args.pubKey,
          grant_type: 'authorization_code'
        }
      })
      .on('response', function (res) {
        console.log('res', res.statusCode);
        if (res.statusCode === 200) {
          res.on('data', function (chunk) {
            var body = JSON.parse(chunk);
            cb(null, body);
          });
        } else {
          cb('Invalid payload while authenticating to Eventbrite');
        }
      })
      .on('error', function (err) {
        cb(err);
      });
  };
};

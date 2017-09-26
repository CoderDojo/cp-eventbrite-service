const request = require('request');

module.exports = () => (args, cb) => {
  request
    .post('https://www.eventbrite.com/oauth/token', {
      form: {
        code: args.code,
        client_secret: args.secKey,
        client_id: args.pubKey,
        grant_type: 'authorization_code',
      },
    })
    .on('response', (res) => {
      if (res.statusCode === 200) {
        res.on('data', (chunk) => {
          const body = JSON.parse(chunk);
          cb(null, body);
        });
      } else {
        cb('Invalid payload while authenticating to Eventbrite');
      }
    })
    .on('error', (err) => {
      cb(err);
    });
};

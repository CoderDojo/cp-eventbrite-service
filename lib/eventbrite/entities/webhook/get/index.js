const request = require('request');

module.exports = () => (args, cb) => {
  request
    .get(`https://www.eventbriteapi.com/v3/users/me/organizations/?token=${args.token}`)
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

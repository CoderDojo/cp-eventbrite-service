var request = require('request');
module.exports = function () {
  var ctx = this.context;
  return function (args, cb) {
    request.delete({
      url: ctx.API_BASE + '/webhooks/' + args.id + '/', // Ending slash required, else 301
      auth: {
        bearer: args.token
      },
      json: true
    },
      function (err, res, body) {
        if (err) return cb(err);
        return cb(null, body);
      });
  };
};

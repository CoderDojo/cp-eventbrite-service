var request = require('request');
module.exports = function () {
  var ctx = this.context;
  return function (args, cb) {
    request.post({
      url: ctx.API_BASE + '/webhooks/',
      json: {
        endpoint_url: args.endpoint_url,
        actions: args.actions,
        event_id: args.event_id || ''
      },
      auth: {
        bearer: args.token
      }
    },
      function (err, res, body) {
        if (err) return cb(err);
        return cb(null, body);
    });
  };
};

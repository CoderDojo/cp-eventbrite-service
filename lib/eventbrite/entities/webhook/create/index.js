const request = require('request');

module.exports = function create() {
  const ctx = this.context;
  return (args, cb) => {
    request.post(
      {
        url: `${ctx.API_BASE}/webhooks/`,
        json: {
          endpoint_url: args.endpoint_url,
          actions: args.actions,
          event_id: args.event_id || '',
        },
        auth: {
          bearer: args.token,
        },
      },
      (err, res, body) => {
        if (err) return cb(err);
        return cb(null, body);
      },
    );
  };
};

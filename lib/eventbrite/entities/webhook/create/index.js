const request = require('request');

module.exports = function create() {
  const ctx = this.context;
  return (args, cb) => {
    request.post(
      {
        url: `${ctx.API_BASE}/organizations/${args.orgId}/webhooks/`,
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
        if (res.statusCode === 200) {
          cb(null, body);
        } else {
          if (res.statusCode === 403) {
            return cb(null, { http$: { status: res.statusCode }, data: res.error });
          }
          return cb(body);
        }
      },
    );
  };
};

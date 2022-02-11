const request = require('request');

module.exports = function create() {
  const ctx = this.context;
  return (args, cb) => {
    console.log('ARGS', args)
    request.post(
      {
        url: `${ctx.API_BASE}/webhooks/`,
        // url: `${ctx.API_BASE}/organizations/801521497943/webhooks/`,
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
        console.log('BODY', body)
        console.log('ERR', err)
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

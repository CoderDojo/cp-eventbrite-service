const request = require('request');

module.exports = function del() {
  const ctx = this.context;
  return (args, cb) => {
    request.delete(
      {
        url: `${ctx.API_BASE}/webhooks/${args.id}/`, // Ending slash required, else 301
        auth: {
          bearer: args.token,
        },
        json: true,
      },
      (err, res, body) => {
        if (err) return cb(err);
        return cb(null, body);
      },
    );
  };
};

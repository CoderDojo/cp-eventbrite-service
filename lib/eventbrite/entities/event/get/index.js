const request = require('request');

module.exports = function get() {
  const ctx = this.context;
  return (args, cb) => {
    const urlBase = `${ctx.API_BASE}/events/`;
    let url = urlBase + args.id;
    // Webhook returns a full url instead of an id
    if (args.url && args.url.includes(urlBase)) url = args.url;
    request.get(
      {
        url,
        qs: args.qs,
        auth: {
          bearer: args.token,
        },
        json: true,
      },
      (err, res, body) => {
        if (err) return cb(err);
        if (body.status_code >= 400) return cb(new Error(body.error));
        return cb(null, body);
      },
    );
  };
};

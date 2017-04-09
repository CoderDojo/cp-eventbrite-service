var request = require('request');
module.exports = function () {
  var ctx = this.context;
  return function (args, cb) {
    var urlBase = ctx.API_BASE + '/events/';
    var url = urlBase + args.id;
    // Webhook returns a full url instead of an id
    if (args.url && args.url.indexOf(urlBase) > -1) url = args.url;
    console.log(url, args.url, urlBase, args.url.indexOf(urlBase) > -1);
    request.get({
      url: url,
      qs: args.qs,
      auth: {
        bearer: args.token
      },
      json: true},
      function (err, res, body) {
        if (err) return cb(err);
        return cb(null, body);
      });
  };
};

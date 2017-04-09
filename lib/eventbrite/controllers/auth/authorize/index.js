var Promise = require('bluebird');
var crypto = require('crypto');
module.exports = function () {
  return function (args, cb) {
    var seneca = this;
    var plugin = args.role;
    var secKey = process.env.EVENTBRITE_SECRET_KEY;
    var pubKey = process.env.EVENTBRITE_PUBLIC_KEY;
    var hashKey = process.env.EVENTBRITE_HASH_KEY;
    var code = args.code;
    var dojoId = args.dojoId;
    var auth = seneca.export('cd-eventbrite/acts')['auth'];
    auth.get({pubKey: pubKey, secKey: secKey, code: code})
    .then(function (body) {
      var token = body.access_token;
      var actions = 'event.published,event.updated,attendee.updated';
      //  If there is an existing sync, we remove the previous webhook
      seneca.act({role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId}, function (err, dojo) {
        if (err) return cb(err);
        if (dojo.eventbriteToken && dojo.eventbriteWhId) {
          seneca.act({role: plugin, entity: 'webhook', cmd: 'delete',
            id: dojo.eventbriteWhId, token: token});
        }
      });
      //  Save eventbrite ids
      var identifier = crypto.createHash('sha256').update(dojoId + token + hashKey).digest('hex');
      //  TODO: check env prod if contains protocol
      var endpointUrl = 'https://' + process.env.HOSTNAME + '/api/2.0/eventbrite/webhooks/' + identifier;
      var webhooks = seneca.export('cd-eventbrite/acts')['webhook'];
      webhooks.create({actions: actions, token: token, endpoint_url: endpointUrl})
      .then(function (webhook) {
        seneca.act({role: 'cd-dojos', cmd: 'update', dojo: {
          'id': dojoId, 'eventbrite_token': token, 'eventbrite_wh_id': webhook.id
        }, user: args.user},
         function (err, dojo) {
           if (err) return cb(err);
           cb(null, {ok: true});
         });
      })
      .catch(function (err) {
        console.log('catch', err);
      });
    });
  };
};

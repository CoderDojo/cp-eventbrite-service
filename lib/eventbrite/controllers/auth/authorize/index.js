var Promise = require('bluebird');
var async = require('async');
var crypto = require('crypto');
module.exports = function () {
  return function (args, cb) {
    var seneca = this;
    var secKey = process.env.EVENTBRITE_SECRET_KEY;
    var pubKey = process.env.EVENTBRITE_PUBLIC_KEY;
    var hashKey = process.env.EVENTBRITE_HASH_KEY;
    var hostname = process.env.HOSTNAME;
    var code = args.code;
    var dojoId = args.dojoId;
    var user = args.user;
    var auth = seneca.export('cd-eventbrite/acts')['auth'];
    auth.get({pubKey: pubKey, secKey: secKey, code: code})
    .then(function (body) {
      var token = body.access_token;
      var actions = 'event.published,event.updated,attendee.updated';
      var webhooks = seneca.export('cd-eventbrite/acts')['webhook'];
      //  If there is an existing sync, we remove the previous webhook
      async.series([
        removeWebhookIfExists,
        createNewWebhook
      ], function () {
        cb(null, {ok: true});
      });
      function removeWebhookIfExists (sCb) {
        seneca.act({role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId}, function (err, dojo) {
          if (err) return cb(err);
          if (dojo.eventbriteToken && dojo.eventbriteWhId) {
            webhooks.delete({id: dojo.eventbriteWhId, token: token})
            .then(sCb)
            // We don't save again as it'll normally be saved afterwards when creating the new webhook
            .catch(function () {
              cb(new Error('Error when deleting existing webhook'));
            });
          } else {
            sCb();
          }
        });
      }
      function createNewWebhook (sCb) {
        //  Save eventbrite ids
        var identifier = crypto.createHash('sha256').update(dojoId + token + hashKey).digest('hex');
        //  TODO: check env prod if contains protocol
        var endpointUrl = 'https://' + hostname + '/api/2.0/eventbrite/webhooks/' + identifier;
        webhooks.create({actions: actions, token: token, endpoint_url: endpointUrl})
        .then(function (webhook) {
          seneca.act({role: 'cd-dojos', entity: 'dojo', cmd: 'update', dojo: {
            'id': dojoId, 'eventbrite_token': token, 'eventbrite_wh_id': webhook.id
          }, user: user},
           function (err, dojo) {
             if (err) return cb(err);
             sCb();
           });
        })
        .catch(function (err) {
          seneca.log.error(err);
          return cb(new Error('An unknown error happened'));
        });
      }
    });
  };
};

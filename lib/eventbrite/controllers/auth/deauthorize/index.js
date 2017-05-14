var Promise = require('bluebird');
var async = require('async');
module.exports = function () {
  return function (args, cb) {
    var seneca = this;
    var dojoId = args.dojoId;
    var user = args.user;
    var webhooks = seneca.export('cd-eventbrite/acts')['webhook'];
    async.waterfall([
      removeWebhook,
      saveDojo
    ], function () {
      cb(null, {ok: true});
    });
    function removeWebhook (sCb) {
      seneca.act({role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId}, function (err, dojo) {
        if (err) return cb(err);
        if (dojo.eventbriteToken && dojo.eventbriteWhId) {
          webhooks.delete({id: dojo.eventbriteWhId, token: dojo.eventbriteToken})
          .then(function () {
            sCb(null, dojo);
          })
          .catch(function () {
            cb(new Error('Error when deleting existing webhook'));
          });
        } else {
          cb(null, {ok: false, err: new Error('No webhook found')});
        }
      });
    }

    function saveDojo (dojo, sCb) {
      dojo.eventbriteToken = null;
      dojo.eventbriteWhId = null;
      seneca.act({role: 'cd-dojos', entity: 'dojo', cmd: 'update', dojo: dojo, user: user}, function (err, dojo) {
        if (err) return cb(err);
        return sCb(null);
      });
    }
  };
};

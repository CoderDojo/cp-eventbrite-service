const async = require('async');

module.exports = () =>
  function deauthorize(args, cb) {
    const seneca = this;
    const dojoId = args.dojoId;
    const user = args.user;
    const webhooks = seneca.export('cd-eventbrite/acts').webhook;
    async.waterfall([removeWebhook, saveDojo], () => {
      cb(null, { ok: true });
    });
    function removeWebhook(sCb) {
      seneca.act({ role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId }, (err, dojo) => {
        if (err) return cb(err);
        if (dojo.eventbriteToken && dojo.eventbriteWhId) {
          webhooks
            .delete({ id: dojo.eventbriteWhId, token: dojo.eventbriteToken })
            .then(() => {
              sCb(null, dojo);
            })
            .catch(() => {
              cb(new Error('Error when deleting existing webhook'));
            });
        } else {
          seneca.log.warning('No webhook found');
          cb(null, { ok: false, err: new Error('No webhook found') });
        }
      });
    }

    function saveDojo(dojo, sCb) {
      const payload = {
        id: dojo.id,
        eventbriteToken: null,
        eventbriteWhId: null,
      };
      seneca.act({ role: 'cd-dojos', entity: 'dojo', cmd: 'update', dojo: payload, user }, (err) => {
        if (err) return cb(err);
        return sCb(null);
      });
    }
  };

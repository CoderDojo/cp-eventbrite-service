const async = require('async');
const crypto = require('crypto');

module.exports = () =>
  function authorize(args, cb) {
    const seneca = this;
    const secKey = process.env.EVENTBRITE_SECRET_KEY;
    const pubKey = process.env.EVENTBRITE_PUBLIC_KEY;
    const hashKey = process.env.EVENTBRITE_HASH_KEY;
    const hostname = process.env.HOSTNAME;
    const code = args.code;
    const dojoId = args.dojoId;
    const user = args.user;
    const auth = seneca.export('cd-eventbrite/acts').auth;
    auth.get({ pubKey, secKey, code }).then((body) => {
      const token = body.access_token;
      const actions = 'event.published,event.updated,attendee.updated';
      const webhooks = seneca.export('cd-eventbrite/acts').webhook;
      //  If there is an existing sync, we remove the previous webhook
      async.series([removeWebhookIfExists, createNewWebhook], () => {
        cb(null, { ok: true });
      });
      function removeWebhookIfExists(sCb) {
        seneca.act({ role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId }, (err, dojo) => {
          if (err) return cb(err);
          if (dojo.eventbriteToken && dojo.eventbriteWhId) {
            webhooks
              .delete({ id: dojo.eventbriteWhId, token })
              .then(() => {
                sCb();
              })
              /*
               * We don't save again as it'll normally be saved afterwards
               * when creating the new webhook
               */
              .catch(() => {
                cb(new Error('Error when deleting existing webhook'));
              });
          } else {
            sCb();
          }
        });
      }
      function createNewWebhook(sCb) {
        //  Save eventbrite ids
        const identifier = crypto
          .createHash('sha256')
          .update(dojoId + token + hashKey)
          .digest('hex');
        const endpointUrl = `https://${hostname}/api/2.0/eventbrite/webhooks/${identifier}`;
        webhooks
          .create({ actions, token, endpoint_url: endpointUrl })
          .then((webhook) => {
            // workaround for https://github.com/senecajs/seneca-transport/issues/154
            if (webhook.http$) return cb(null, webhook);
            seneca.act({
              role: 'cd-dojos',
              entity: 'dojo',
              cmd: 'update',
              dojo: {
                id: dojoId,
                eventbrite_token: token,
                eventbrite_wh_id: webhook.id,
              },
              user,
            }, (err) => {
              if (err) return cb(err);
              sCb();
            });
          })
          .catch((err) => {
            seneca.log.error(err);
            return cb(new Error('An unknown error happened'));
          });
      }
    });
  };

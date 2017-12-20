const async = require('async');
/**
 * Main entry point for webhooks
 * @return {Object} http  Http status of the webhook handler
 */
module.exports = () =>
  function handlers(args, done) {
    const seneca = this;
    const plugin = args.role;
    const payload = args.config;
    const apiUrl = args.api_url;
    const webhookHandlers = {
      'event.published': 'unimplementHandler',
      'attendee.updated': 'unimplementHandler',
      'event.updated': 'eventHandler',
    };
    const act = webhookHandlers[payload.action];
    // Check if webhook exists, unsub if 410. Should avoid zombies wh
    function checkWebhook(wfCb) {
      seneca.act(
        {
          role: 'cd-dojos',
          entity: 'dojo',
          cmd: 'search',
          query: { eventbriteWhId: payload.webhook_id },
        },
        (err, dojos) => {
          if (err) return done(err);
          if (dojos.length === 1) {
            return wfCb(null, dojos[0]);
          }
          return done(null, { http$: { status: 410 } });
        },
      );
    }
    function delegateWebhook(dojo) {
      if (act) {
        seneca.act(
          {
            role: plugin,
            ctrl: 'webhook',
            cmd: act,
            config: payload,
            api_url: apiUrl,
            dojo,
          },
          done,
        );
      } else {
        done(null, { http$: { status: 401 }, data: 'Unhandled webhook, complain to zen dev' });
      }
    }

    async.waterfall([checkWebhook, delegateWebhook]);
  };

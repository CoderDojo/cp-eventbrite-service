'use strict';
var async = require('async');
/**
 * Main entry point for webhooks
 */
module.exports = function () {
  return function (args, done) {
    var seneca = this;
    var plugin = args.role;
    var payload = args.config;
    var webhookHandlers = {
      'event.updated': 'eventHandler'
    };
    var act = webhookHandlers[payload.action];
    // Check if webhook exists, unsub if 410. Should avoid zombies wh
    function checkWebhook (wfCb) {
      seneca.act({role: 'cd-dojos', entity: 'dojo', cmd: 'search', query: {eventbriteWhId: payload.webhook_id}},
        function (err, dojos) {
          if (err) return done(err);
          if (dojos.length === 1) {
            return wfCb(null, dojos[0]);
          } else {
            return done(null, {http$: {status: 410}});
          }
        });
    }
    function delegateWebhook (dojo, wfCb) {
      if (act) {
        seneca.act({role: plugin, ctrl: 'webhook', cmd: act,
          config: payload, api_url: args.api_url, dojo: dojo}, done);
      } else {
        done(null, {http$: {status: 401}, data: 'Unhandled webhook, complain to zen dev'});
      }
    }

    async.waterfall([
      checkWebhook,
      delegateWebhook
    ]);
  };
};

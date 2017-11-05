'use strict';
var _ = require('lodash');
var countries = require('country-list')();
var Promise = require('bluebird');
var moment = require('moment');
/**
 * Webhook handler for any event registred by our webhook but not handled
 * It should reduce a certain number of unnecesary logs from zen-api
 * @return {Object}  http code result (200)
 */
module.exports = function () {
  return function (args, done) {
    return done(null, { http$: { status: 200 } });
  };
};

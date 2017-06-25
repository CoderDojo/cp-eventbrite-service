'use strict';
var _ = require('lodash');
/**
 * Expose Eventbrite public API token
 * @return {String} token Eventbrite public API token
 */
module.exports = function () {
  return function (args, done) {
    var response = {};
    var token = process.env.EVENTBRITE_PUBLIC_KEY;
    if (!_.isEmpty(token)) {
      response.token = token;
      return done(null, response);
    }
    return done(new Error('Missing EventBrite Public Token'));
  };
};

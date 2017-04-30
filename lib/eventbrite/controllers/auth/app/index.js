var _ = require('lodash');

module.exports = function () {
  return function (args, done) {
    var seneca = this;
    var plugin = args.role;
    var response = {};
    var token = process.env.EVENTBRITE_PUBLIC_KEY;
    if (!_.isEmpty(token)) {
      response.token = token;
      return done(null, response);
    }
    return done(new Error('Missing EventBrite Public Token'));
  };
};

var glob = require('glob');
var _ = require('lodash');
var path = require('path');
/**
 * Aggregate all permissions functions/imports into one for cp-perm
 * @return {Object} Extend of all perms
 */
module.exports = function () {
  var perms = {'cd-eventbrite': {}};
  // the /*/** focus on anything at least one level beyond itself
  var files = glob.sync('./*/**/perm.js', {cwd: __dirname});
  _.each(files, function (file) {
    var ctrl = file.split(path.sep)[1]; // 0 = ., 1 = ctrlName
    var perm = require(file);
    if (!perms['cd-eventbrite'][ctrl]) perms['cd-eventbrite'][ctrl] = {};
    if (typeof (perm) === 'function') {
      perms['cd-eventbrite'][ctrl] = _.extend(perms['cd-eventbrite'][ctrl], perm());
    } else {
      perms['cd-eventbrite'][ctrl] = _.extend(perms['cd-eventbrite'][ctrl], perm);
    }
  });
  return perms;
};

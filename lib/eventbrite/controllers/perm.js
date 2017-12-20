const glob = require('glob');
const _ = require('lodash');
const path = require('path');

/**
 * Aggregate all permissions functions/imports into one for cp-perm
 * @return {Object} Extend of all perms
 */
module.exports = () => {
  const perms = { 'cd-eventbrite': {} };
  // the /*/** focus on anything at least one level beyond itself
  const files = glob.sync('./*/**/perm.js', { cwd: __dirname });
  _.each(files, (file) => {
    const ctrl = file.split(path.sep)[1]; // 0 = ., 1 = ctrlName
    const perm = require(file); // eslint-disable-line
    if (!perms['cd-eventbrite'][ctrl]) perms['cd-eventbrite'][ctrl] = {};
    if (typeof perm === 'function') {
      perms['cd-eventbrite'][ctrl] = _.extend(perms['cd-eventbrite'][ctrl], perm());
    } else {
      perms['cd-eventbrite'][ctrl] = _.extend(perms['cd-eventbrite'][ctrl], perm);
    }
  });
  return perms;
};

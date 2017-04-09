var seneca = require('../../imports')({log: {level: 'info'}});
require('../../network')(seneca);
var _ = require('lodash');
var service = 'cd-eventbrite';
// Test data
var fixes = {};
// we're getting high here !!
fixes.event = require('../fixtures/event.js')[0];

var async = require('async');
var _lab = require('lab');
var lab = exports.lab = _lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = require('code').expect;

describe('cp-eventbrite-service-controller', function () {
  var testedEnt = {};
  lab.before(function (done) {
    seneca.ready(function () {
      done();
    });
  });
});

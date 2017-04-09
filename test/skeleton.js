var seneca = require('../imports')({log: {level: 'info'}});
require('../network')(seneca);
var _ = require('lodash');
var flat = require('flat');
var service = 'cd-eventbrite';
// ENTITIES
var entities = {};
entities['auth'] = require('../lib/eventbrite/entities/auth/index.js').bind(seneca)();
entities['event'] = require('../lib/eventbrite/entities/event/index.js').bind(seneca)();
entities['webhook'] = require('../lib/eventbrite/entities/webhook/index.js').bind(seneca)();
// CTRLS
var ctrls = {};
ctrls['auth'] = require('../lib/eventbrite/controllers/auth/index.js').bind(seneca)();
ctrls['webhook'] = require('../lib/eventbrite/controllers/webhook/index.js').bind(seneca)();

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

  it('should register entity acts', function (done) {
    var acts = seneca.list();
    var expected_acts = [];
    _.each(entities, function (entity) {
      _.each(entity.acts, function (def, act) {
        expected_acts.push({role: service, entity: entity.name, cmd: act});
      });
    });
    seneca.log.info('1/', acts.length - _.pullAllWith(_.clone(acts), expected_acts, _.isEqual).length, expected_acts.length);
    expect(acts.length - _.pullAllWith(_.clone(acts), expected_acts, _.isEqual).length).to.be.equal(expected_acts.length);
    expect(expected_acts.length).to.be.above(1);
    done();
  });

  it('should register controllers acts', function (done) {
    // TODO : extend to other controllers
    async.eachSeries(ctrls, function (ctl, cbS) {
      async.eachOfSeries(ctl.acts, function (fixt, key, cbOS) {
        var cmd = {role: service, ctrl: ctl.name, cmd: key};
        var exists = seneca.has(cmd);
        seneca.log.info('2/ cmd:', cmd, ' exists', exists, typeof exists);
        expect(exists).to.be.true();
        cbOS();
      }, cbS);
    }, done);
  });

  // Explicit perms to avoid forgetting adding some
  it('should have as many perms as there is acts', function (done) {
    var perms = flat(require('../lib/eventbrite/controllers/perm')(), { maxDepth: 3 });
    var ctrlActs = _.filter(seneca.list(), function (o) { return _.has(o, 'ctrl'); });
    // This extra check will only be doable once we do https://github.com/CoderDojo/cp-permissions-plugin/issues/8
    // var acts = _.filter(seneca.list(), {cmd: 'check_permissions'});
    // expect(_.keys(perms).length).to.be.equal(acts.length);
    expect(_.keys(perms).length).to.be.equal(ctrlActs.length);
    done();
  });

  // // VALIDATION
  // No need to validate them all, we just want to verify the bootloader (/lib/index)
  it('should validate entities acts with joi', function (done) {
    seneca.act({role: 'cd-eventbrite', entity: 'event', cmd: 'get', id: {}}, function (err, app) {
      expect(err.code).to.be.equal('act_invalid_msg');
      done();
    });
  });
  //
  it('should validate entities acts while promised with joi', function (done) {
    var app = seneca.export('cd-eventbrite/acts')['event'];
    app.get({id: {}})
    .catch(function (err) {
      expect(err.code).to.be.equal('act_invalid_msg');
      done();
    });
  });
  //
  it('should validate controllers acts with joi', function (done) {
    seneca.act({role: 'cd-eventbrite', ctrl: 'auth', cmd: 'authorize', dojoId: {}}, function (err, app) {
      expect(err.code).to.be.equal('act_invalid_msg');
      done();
    });
  });
});

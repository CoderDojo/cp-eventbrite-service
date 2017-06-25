'use strict';

var lab = exports.lab = require('lab').script();
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));
var sinon = require('sinon');
var fn = require('./index.js');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');

lab.experiment.only('webhook/eventHandler', function () {
  var sandbox;
  var senecaStub;
  var sync;
  var exportMock;
  var dojo = {
    id: 1000,
    eventbriteToken: 'access_token'
  };
  var apiUrl = 'http://eb.com/theevent';
  lab.beforeEach(function (done) {
    sandbox = sinon.sandbox.create();
    senecaStub = {
      act: sandbox.stub(),
      export: sandbox.stub(),
      log: {
        warning: sandbox.stub()
      }
    };
    exportMock = {
      'event': {
        get: sandbox.stub()
      }
    };
    senecaStub.export.withArgs('cd-eventbrite/acts').returns(exportMock);
    sync = fn().bind(senecaStub);
    done();
  });

  lab.afterEach(function (done) {
    sandbox.restore();
    sandbox.reset();
    done();
  });

  lab.test('should create a draft event', function (done) {
    // ARRANGE
    var createdAt = new Date();
    var eventInfoMock = {
      eventbriteId: 2000,
      name: 'test EB-Event',
      createdAt: createdAt,
      status: 'saved',
      dojoId: 1000,
      type: 'one-off'
    };
    var eventbriteEventMock = {
      id: 2000,
      name: {text: 'test EB-Event'},
      created: createdAt
    };
    exportMock.event.get.callsFake(function (args) {
      expect(args.url).to.equal(apiUrl);
      expect(args.qs).to.eql({expand: 'venue,ticket_classes'});
      expect(args.token).to.equal(dojo.eventbriteToken);
      return Promise.resolve(eventbriteEventMock);
    });
    senecaStub.act.withArgs({role: 'cd-events', cmd: 'listEvents', query: {eventbriteId: 2000}})
    .callsFake(function (args, done) {
      done(null, []);
    });
    senecaStub.act.withArgs({role: 'cd-events', cmd: 'saveEvent',
      eventInfo: eventInfoMock
    })
    .callsFake(function (args, done) {
      done(null, args.eventInfo);
    });
    // ACT
    sync({dojo: dojo, api_url: apiUrl}, function (err, ret) {
      expect(ret).to.be.eql({http$: {status: 200}});
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledTwice;
      expect(exportMock.event.get).to.have.been.calledOnce;
      done();
    });
  });

  lab.experiment('addressToString', function () {
    lab.beforeEach(function (done) {
      sandbox.restore();
      sandbox.reset();
      done();
    });
    lab.test.only('should concatenate fields in order', function (done) {
      // ARRANGE
      var createdAt = new Date();
      var eventInfoMock = {
        eventbriteId: 2000,
        name: 'test EB-Event',
        createdAt: createdAt,
        status: 'saved',
        dojoId: 1000,
        type: 'one-off',
        address: 'dat street,\nDublin,\nD1',
        city: { nameWithHierarchy: 'Dublin' }
      };
      var eventbriteEventMock = {
        id: 2000,
        name: {text: 'test EB-Event'},
        created: createdAt,
        venue: {
          address: {
            address_1: 'dat street',
            city: 'Dublin',
            postal_code: 'D1'
          }
        }
      };
      exportMock.event.get.callsFake(function (args) {
        expect(args.url).to.equal(apiUrl);
        expect(args.qs).to.eql({expand: 'venue,ticket_classes'});
        expect(args.token).to.equal(dojo.eventbriteToken);
        return Promise.resolve(eventbriteEventMock);
      });
      senecaStub.act.withArgs({role: 'cd-events', cmd: 'listEvents', query: {eventbriteId: 2000}})
      .callsFake(function (args, done) {
        done(null, []);
      });
      senecaStub.act.withArgs({role: 'cd-events', cmd: 'saveEvent',
        eventInfo: eventInfoMock
      })
      .callsFake(function (args, done) {
        done(null, args.eventInfo);
      });
      // ACT
      sync({dojo: dojo, api_url: apiUrl}, function (err, ret) {
        expect(ret).to.be.eql({http$: {status: 200}});
        expect(senecaStub.export).to.have.been.calledOnce;
        expect(senecaStub.act).to.have.been.calledTwice;
        expect(exportMock.event.get).to.have.been.calledOnce;
        done();
      });
    });
  });


  lab.test('should update an event', function (done) {
    // ARRANGE
    var createdAt = new Date();
    var eventInfoMock = {
      id: 3000,
      eventbriteId: 2000,
      name: 'test EB-Event',
      createdAt: createdAt,
      status: 'saved',
      dojoId: 1000,
      description: 'Bring packed lunch ;)',
      type: 'one-off'
    };
    var eventbriteEventMock = {
      id: 2000,
      name: {text: 'test EB-Event'},
      created: createdAt
    };
    exportMock.event.get.callsFake(function (args) {
      expect(args.url).to.equal(apiUrl);
      expect(args.qs).to.eql({expand: 'venue,ticket_classes'});
      expect(args.token).to.equal(dojo.eventbriteToken);
      return Promise.resolve(eventbriteEventMock);
    });
    senecaStub.act.withArgs({role: 'cd-events', cmd: 'listEvents', query: {eventbriteId: 2000}})
    .callsFake(function (args, done) {
      done(null, [{id: 3000, name: 'oldEventTest', description: 'Bring packed lunch ;)'}]);
    });
    senecaStub.act.withArgs({role: 'cd-events', cmd: 'saveEvent',
      eventInfo: eventInfoMock
    })
    .callsFake(function (args, done) {
      done(null, args.eventInfo);
    });
    // ACT
    sync({dojo: dojo, api_url: apiUrl}, function (err, ret) {
      expect(ret).to.be.eql({http$: {status: 200}});
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledTwice;
      expect(exportMock.event.get).to.have.been.calledOnce;
      done();
    });
  });
  lab.experiment('syncEvent statuses', function (done) {
    lab.beforeEach(function (done) {
      sandbox.restore();
      sandbox.reset();
      done();
    });
    lab.test('should publish an event', function (done) {
      // ARRANGE
      var createdAt = new Date();
      var eventInfoMock = {
        id: 3000,
        eventbriteId: 2000,
        name: 'test EB-Event',
        createdAt: createdAt,
        status: 'published',
        dojoId: 1000,
        description: 'Bring packed lunch ;)',
        type: 'one-off'
      };
      var eventbriteEventMock = {
        id: 2000,
        name: {text: 'test EB-Event'},
        created: createdAt
      };
      async.each(['live', 'started', 'ended', 'completed'], function (status, cb) {
        eventbriteEventMock.status = status;
        exportMock.event.get.callsFake(function (args) {
          expect(args.url).to.equal(apiUrl);
          expect(args.qs).to.eql({expand: 'venue,ticket_classes'});
          expect(args.token).to.equal(dojo.eventbriteToken);
          return Promise.resolve(eventbriteEventMock);
        });
        senecaStub.act.withArgs({role: 'cd-events', cmd: 'listEvents', query: {eventbriteId: 2000}})
        .callsFake(function (args, done) {
          done(null, [{id: 3000, name: 'oldEventTest', description: 'Bring packed lunch ;)'}]);
        });
        senecaStub.act.withArgs({role: 'cd-events', cmd: 'saveEvent',
          eventInfo: eventInfoMock
        })
        .callsFake(function (args, done) {
          done(null, args.eventInfo);
        });
        // ACT
        sync({dojo: dojo, api_url: apiUrl}, function (err, ret) {
          // Counting here is dodgy since we're in a loop
          expect(ret).to.be.eql({http$: {status: 200}});
          cb();
        });
      }, done);
    });
    lab.test('should cancel an event', function (done) {
      // ARRANGE
      var createdAt = new Date();
      var eventInfoMock = {
        eventbriteId: 2000,
        name: 'test EB-Event',
        createdAt: createdAt,
        status: 'cancelled',
        dojoId: 1000,
        type: 'one-off'
      };
      var eventbriteEventMock = {
        id: 2000,
        name: {text: 'test EB-Event'},
        created: createdAt,
        status: 'canceled'
      };
      exportMock.event.get.callsFake(function (args) {
        expect(args.url).to.equal(apiUrl);
        expect(args.qs).to.eql({expand: 'venue,ticket_classes'});
        expect(args.token).to.equal(dojo.eventbriteToken);
        return Promise.resolve(eventbriteEventMock);
      });
      senecaStub.act.withArgs({role: 'cd-events', cmd: 'listEvents', query: {eventbriteId: 2000}})
      .callsFake(function (args, done) {
        done(null, []);
      });
      senecaStub.act.withArgs({role: 'cd-events', cmd: 'saveEvent',
        eventInfo: eventInfoMock
      })
      .callsFake(function (args, done) {
        done(null, args.eventInfo);
      });
      // ACT
      sync({dojo: dojo, api_url: apiUrl}, function (err, ret) {
        expect(ret).to.be.eql({http$: {status: 200}});
        expect(senecaStub.export).to.have.been.calledOnce;
        expect(senecaStub.act).to.have.been.calledTwice;
        expect(exportMock.event.get).to.have.been.calledOnce;
        done();
      });
    });
  });



  lab.test('should return a 500 on error on multiple event with same ebId', function (done) {
    var eventbriteEventMock = {
      id: 2000,
      name: {text: 'test EB-Event'},
      created: new Date()
    };
    senecaStub.act.withArgs({role: 'cd-events', cmd: 'listEvents', query: { eventbriteId: 2000}})
    .callsFake(function (args, done) {
      done(null, [{id: 100}, {id: 200}]);
    });
    exportMock.event.get.callsFake(function (args) {
      expect(args.url).to.equal(apiUrl);
      expect(args.qs).to.eql({expand: 'venue,ticket_classes'});
      expect(args.token).to.equal(dojo.eventbriteToken);
      return Promise.resolve(eventbriteEventMock);
    });
    sync({dojo: dojo, api_url: apiUrl}, function (err, res) {
      expect(res.http$).to.include({status: 500});
      expect(exportMock.event.get).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledOnce;
      done();
    });
  });
  lab.test('should return a 500 when EB event is not found', function (done) {
    exportMock.event.get.callsFake(function (args) {
      expect(args.url).to.equal(apiUrl);
      expect(args.qs).to.eql({expand: 'venue,ticket_classes'});
      expect(args.token).to.equal(dojo.eventbriteToken);
      return Promise.reject();
    });
    sync({dojo: dojo, api_url: apiUrl}, function (err, res) {
      expect(res.http$).to.include({status: 500});
      expect(exportMock.event.get).to.have.been.calledOnce;
      done();
    });
  });
});

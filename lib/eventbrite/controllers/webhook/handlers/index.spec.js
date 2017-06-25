'use strict';

var lab = exports.lab = require('lab').script();
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));
var sinon = require('sinon');
var fn = require('./index.js');
var Promise = require('bluebird');

lab.experiment('Webhook/handlers', function () {
  var sandbox;
  var senecaStub;
  var handler;
  var apiUrl = 'http//eb.com/';
  lab.beforeEach(function (done) {
    sandbox = sinon.sandbox.create();
    senecaStub = {
      act: sandbox.stub()
    };
    handler = fn().bind(senecaStub);
    done();
  });

  lab.experiment('checkWebhook', function () {
    lab.afterEach(function (done) {
      sandbox.restore();
      done();
    });
    lab.test('should use the only dojo', function (done) {
      var payload = {
        webhook_id: 42,
        action: 'event.updated'
      };
      senecaStub.act.withArgs({role: 'cd-dojos', entity: 'dojo', cmd: 'search', query: {eventbriteWhId: payload.webhook_id}})
      .callsFake(function (args, done) {
        done(null, [{id: 1000}]);
      });
      senecaStub.act.withArgs({role: 'cd-eventbrite', ctrl: 'webhook', cmd: 'eventHandler',
        config: payload, api_url: apiUrl, dojo: {id: 1000}})
      .callsFake(function (args, done) {
        done(null, {http$: {status: 200}});
      });
      handler({role: 'cd-eventbrite', api_url: apiUrl, config: payload}, function (err, res) {
        expect(res).to.eql({http$: {status: 200}});
        expect(senecaStub.act).to.have.been.calledTwice;
        // The fact that the 2nd stub worked mean we got the expected params
        done();
      });
    });
    lab.test('should return 410 if more than one dojo', function (done) {
      var payload = {
        webhook_id: 42,
        action: 'event.updated'
      };
      senecaStub.act.withArgs({role: 'cd-dojos', entity: 'dojo', cmd: 'search', query: {eventbriteWhId: payload.webhook_id}})
      .callsFake(function (args, done) {
        done(null, [{id: 1000}, {id: 1001}]);
      });
      handler({role: 'cd-eventbrite', api_url: apiUrl, config: payload}, function (err, res) {
        expect(res.http$).to.include({status: 410});
        expect(senecaStub.act).to.have.been.calledOnce;
        done();
      });
    });
    lab.test('should return 410 if no dojo', function (done) {
      var payload = {
        webhook_id: 42,
        action: 'event.updated'
      };
      senecaStub.act.withArgs({role: 'cd-dojos', entity: 'dojo', cmd: 'search', query: {eventbriteWhId: payload.webhook_id}})
      .callsFake(function (args, done) {
        done(null, []);
      });
      handler({role: 'cd-eventbrite', api_url: apiUrl, config: payload}, function (err, res) {
        expect(res.http$).to.include({status: 410});
        expect(senecaStub.act).to.have.been.calledOnce;
        done();
      });
    });
  });
  lab.experiment('delegateWebhook', function () {
    lab.afterEach(function (done) {
      sandbox.restore();
      done();
    });
    lab.test('should call the appropriate handler', function (done) {
      var payload = {
        webhook_id: 42,
        action: 'event.updated'
      };
      senecaStub.act.withArgs({role: 'cd-dojos', entity: 'dojo', cmd: 'search', query: {eventbriteWhId: payload.webhook_id}})
      .callsFake(function (args, done) {
        done(null, [{id: 1000}]);
      });
      senecaStub.act.withArgs({role: 'cd-eventbrite', ctrl: 'webhook', cmd: 'eventHandler',
        config: payload, api_url: apiUrl, dojo: {id: 1000}})
      .callsFake(function (args, done) {
        done(null, {http$: {status: 200}});
      });
      handler({role: 'cd-eventbrite', api_url: apiUrl, config: payload}, function (err, res) {
        expect(res.http$).to.include({status: 200});
        expect(senecaStub.act).to.have.been.calledTwice;
        // Handler checking is done as part of params of the stub
        done();
      });
    });
    lab.test('should return 401 when no matching act is found', function (done) {
      var payload = {
        webhook_id: 42,
        action: 'event.bananized'
      };
      senecaStub.act.withArgs({role: 'cd-dojos', entity: 'dojo', cmd: 'search', query: {eventbriteWhId: payload.webhook_id}})
      .callsFake(function (args, done) {
        done(null, [{id: 1000}]);
      });
      handler({role: 'cd-eventbrite', api_url: apiUrl, config: payload}, function (err, res) {
        expect(res.http$).to.include({status: 401});
        expect(senecaStub.act).to.have.been.calledOnce;
        done();
      });
    });
  })
});

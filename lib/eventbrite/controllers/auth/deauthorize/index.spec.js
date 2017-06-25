'use strict';

var lab = exports.lab = require('lab').script();
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));
var sinon = require('sinon');
var fn = require('./index.js');
var Promise = require('bluebird');

lab.experiment('Auth/deauthorize', function () {
  var sandbox;
  var senecaStub;
  var deauthorize;
  var exportMock;
  var dojoId = 1000;
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
      'webhook': {
        delete: sandbox.stub()
      }
    };
    senecaStub.export.withArgs('cd-eventbrite/acts').returns(exportMock);
    deauthorize = fn().bind(senecaStub);
    done();
  });

  lab.afterEach(function (done) {
    sandbox.restore();
    done();
  });

  lab.test('should remove a webhook for this dojo', function (done) {
    // ARRANGE
    var dojoLoadMock = {
      id: dojoId,
      eventbriteToken: 'access_token',
      eventbriteWhId: 42
    };
    var dojoSaveMock = {
      id: dojoId,
      eventbriteToken: null,
      eventbriteWhId: null
    };
    senecaStub.act
      .withArgs({role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId})
      .callsFake(function (args, cb) {
        cb(null, dojoLoadMock);
      });
    senecaStub.act
      .withArgs({role: 'cd-dojos', entity: 'dojo', cmd: 'update', dojo: dojoSaveMock, user: {id: 1}})
      .callsFake(function (args, cb) {
        cb(null, {id: dojoId});
      });
    exportMock.webhook.delete.callsFake(function (args) {
      expect(args.id).to.equal(42);
      expect(args.token).to.equal('access_token');
      return Promise.resolve();
    });
    deauthorize({dojoId: dojoId, user: {id: 1}}, function (err, ret) {
      expect(ret).to.be.eql({ok: true});
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledTwice;
      expect(exportMock.webhook.delete).to.have.been.calledOnce;
      done();
    });
  });

  lab.test('should trigger an error if the dojo has no webhook', function (done) {
    // ARRANGE
    var dojoLoadMock = {
      id: dojoId
    };
    var dojoSaveMock = {
      id: dojoId,
      eventbriteToken: 'access_token',
      eventbriteWhId: 42
    };
    senecaStub.act
      .withArgs({role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId})
      .callsFake(function (args, cb) {
        cb(null, dojoLoadMock);
      });
    exportMock.webhook.delete.callsFake(function (args) {
      expect(args.id).to.equal(42);
      // We use the current access token, not the old one
      expect(args.token).to.equal('access_token');
      return Promise.resolve();
    });
    senecaStub.act
      .withArgs({role: 'cd-dojos', entity: 'dojo', cmd: 'update', dojo: dojoSaveMock, user: {id: 1}})
      .callsFake(function (args, cb) {
        cb(null, {id: dojoId});
      });
      // ACT
    deauthorize({dojoId: dojoId, user: {id: 1}}, function (err, ret) {
      expect(ret.ok).to.be.false;
      expect(ret.err.toString()).to.equal('Error: No webhook found');
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledOnce;
      done();
    });
  });
});

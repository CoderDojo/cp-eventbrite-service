'use strict';

var lab = exports.lab = require('lab').script();
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));
var sinon = require('sinon');
var fn = require('./index.js');
var Promise = require('bluebird');

lab.experiment('Auth/authorize', function () {
  var sandbox;
  var senecaStub;
  var authorize;
  var exportMock;
  var dojoId = 1000;
  var code = 'abcdefgh';
  process.env.EVENTBRITE_HASH_KEY = 'hashKey';
  process.env.EVENTBRITE_PUBLIC_KEY = 'publicKey';
  process.env.EVENTBRITE_SECRET_KEY = 'secretKey';
  lab.beforeEach(function (done) {
    sandbox = sinon.sandbox.create();
    senecaStub = {
      act: sandbox.stub(),
      export: sandbox.stub()
    };
    exportMock = {
      'auth': {
        get: sandbox.stub().callsFake(function (args) {
          expect(args.pubKey).to.equal(process.env.EVENTBRITE_PUBLIC_KEY);
          expect(args.secKey).to.equal(process.env.EVENTBRITE_SECRET_KEY);
          expect(args.code).to.equal(code);
          return Promise.resolve({
            access_token: 'access_token'
          });
        })
      },
      'webhook': {
        create: sandbox.stub().callsFake(function (args) {
          expect(args.token).to.equal('access_token');
          expect(args.actions).to.equal('event.published,event.updated,attendee.updated');
          expect(args.endpoint_url).to.equal('https://localhost.localdomain/api/2.0/eventbrite/webhooks/fe28b4ee994fa96f6a6f4e2829929ed25aa941fa6aab9acfff728f55dc125fe3');
          return Promise.resolve({
            id: 42
          });
        }),
        delete: sandbox.stub()
      }
    };
    senecaStub.export.withArgs('cd-eventbrite/acts').returns(exportMock);
    authorize = fn().bind(senecaStub);
    done();
  });

  lab.afterEach(function (done) {
    sandbox.restore();
    done();
  });

  lab.test('should create a new webhook for this dojo', function (done) {
    // ARRANGE
    var dojoLoadMock = {
      id: dojoId
    };
    var dojoSaveMock = {
      id: dojoId,
      eventbrite_token: 'access_token',
      eventbrite_wh_id: 42
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
    authorize({dojoId: dojoId, code: code, user: {id: 1}}, function (err, ret) {
      expect(ret).to.be.eql({ok: true});
      expect(senecaStub.act).to.have.been.calledTwice;
      expect(senecaStub.export).to.have.been.calledTwice;
      expect(exportMock.auth.get).to.have.been.calledOnce;
      expect(exportMock.webhook.create).to.have.been.calledOnce;
      done();
    });
  });

  lab.test('should remove webhook if it exists', function (done) {
    // ARRANGE
    var dojoLoadMock = {
      id: dojoId,
      eventbriteToken: 'access_token-1',
      eventbriteWhId: 41
    };
    var dojoSaveMock = {
      id: dojoId,
      eventbrite_token: 'access_token',
      eventbrite_wh_id: 42
    };
    senecaStub.act
      .withArgs({role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId})
      .callsFake(function (args, cb) {
        cb(null, dojoLoadMock);
      });
    exportMock.webhook.delete.callsFake(function (args) {
      expect(args.id).to.equal(41);
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
    authorize({dojoId: dojoId, code: code, user: {id: 1}}, function (err, ret) {
      expect(ret).to.be.eql({ok: true});
      expect(exportMock.auth.get).to.have.been.calledOnce;
      expect(senecaStub.export).to.have.been.calledTwice;
      expect(senecaStub.act).to.have.been.calledTwice;
      expect(exportMock.webhook.delete).to.have.been.calledOnce;
      expect(exportMock.webhook.create).to.have.been.calledOnce;
      done();
    });
  });
});

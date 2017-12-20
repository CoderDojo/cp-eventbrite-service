exports.lab = require('lab').script();

const lab = exports.lab;
const chai = require('chai');

const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const fn = require('./index.js');
const Promise = require('bluebird');

lab.experiment('Auth/deauthorize', () => {
  let sandbox;
  let senecaStub;
  let deauthorize;
  let exportMock;
  const dojoId = 1000;
  lab.beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    senecaStub = {
      act: sandbox.stub(),
      export: sandbox.stub(),
      log: {
        warning: sandbox.stub(),
      },
    };
    exportMock = {
      webhook: {
        delete: sandbox.stub(),
      },
    };
    senecaStub.export.withArgs('cd-eventbrite/acts').returns(exportMock);
    deauthorize = fn().bind(senecaStub);
    done();
  });

  lab.afterEach((done) => {
    sandbox.restore();
    done();
  });

  lab.test('should remove a webhook for this dojo', (done) => {
    // ARRANGE
    const dojoLoadMock = {
      id: dojoId,
      eventbriteToken: 'access_token',
      eventbriteWhId: 42,
    };
    const dojoSaveMock = {
      id: dojoId,
      eventbriteToken: null,
      eventbriteWhId: null,
    };
    senecaStub.act
      .withArgs({ role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId })
      .callsFake((args, cb) => {
        cb(null, dojoLoadMock);
      });
    senecaStub.act
      .withArgs({
        role: 'cd-dojos',
        entity: 'dojo',
        cmd: 'update',
        dojo: dojoSaveMock,
        user: { id: 1 },
      })
      .callsFake((args, cb) => {
        cb(null, { id: dojoId });
      });
    exportMock.webhook.delete.callsFake((args) => {
      expect(args.id).to.equal(42);
      expect(args.token).to.equal('access_token');
      return Promise.resolve();
    });
    deauthorize({ dojoId, user: { id: 1 } }, (err, ret) => {
      expect(ret).to.be.eql({ ok: true });
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledTwice;
      expect(exportMock.webhook.delete).to.have.been.calledOnce;
      done();
    });
  });

  lab.test('should trigger an error if the dojo has no webhook', (done) => {
    // ARRANGE
    const dojoLoadMock = {
      id: dojoId,
    };
    const dojoSaveMock = {
      id: dojoId,
      eventbriteToken: 'access_token',
      eventbriteWhId: 42,
    };
    senecaStub.act
      .withArgs({ role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId })
      .callsFake((args, cb) => {
        cb(null, dojoLoadMock);
      });
    exportMock.webhook.delete.callsFake((args) => {
      expect(args.id).to.equal(42);
      // We use the current access token, not the old one
      expect(args.token).to.equal('access_token');
      return Promise.resolve();
    });
    senecaStub.act
      .withArgs({
        role: 'cd-dojos',
        entity: 'dojo',
        cmd: 'update',
        dojo: dojoSaveMock,
        user: { id: 1 },
      })
      .callsFake((args, cb) => {
        cb(null, { id: dojoId });
      });
    // ACT
    deauthorize({ dojoId, user: { id: 1 } }, (err, ret) => {
      expect(ret.ok).to.be.false;
      expect(ret.err.toString()).to.equal('Error: No webhook found');
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledOnce;
      done();
    });
  });
});

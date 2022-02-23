exports.lab = require('lab').script();

const lab = exports.lab;
const chai = require('chai');

const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const fn = require('./index.js');
const Promise = require('bluebird');

process.env.HOSTNAME = 'localhost.localdomain';

lab.experiment('Auth/authorize', () => {
  let sandbox;
  let senecaStub;
  let authorize;
  let exportMock;
  const dojoId = 1000;
  const code = 'abcdefgh';
  const userToken = 'D48HKJJ91823';
  const orgId = 801521497943;

  process.env.EVENTBRITE_HASH_KEY = 'hashKey';

  lab.beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    senecaStub = {
      act: sandbox.stub(),
      export: sandbox.stub(),
      log: {
        error: sandbox.stub(),
      },
    };
    exportMock = {
      webhook: {
        create: sandbox.stub().callsFake((args) => {
          // args.token = userToken;
          // args.orgId = orgId;

          expect(args.endpoint_url).to.equal('https://smee.io/WHGx6yjUMfCAz4Xl');
          expect(args.actions).to.equal('event.published,event.updated,attendee.updated');
          // expect(args.endpoint_url).to.equal(
          //   'https://localhost.localdomain/api/2.0/eventbrite/webhooks/fe28b4ee994fa96f6a6f4e2829929ed25aa941fa6aab9acfff728f55dc125fe3',
          // );

          return Promise.resolve({
            id: 42,
          });
        }),
        delete: sandbox.stub()
      },
    };
    senecaStub.export.withArgs('cd-eventbrite/acts').returns(exportMock);
    authorize = fn().bind(senecaStub);
    done();
  });

  lab.afterEach((done) => {
    sandbox.restore();
    done();
  });

  lab.test('should create a new webhook for this dojo', (done) => {
    // ARRANGE
    const dojoLoadMock = {
      id: dojoId,
    };
    const dojoSaveMock = {
      id: dojoId,
      eventbrite_token: userToken,
      eventbrite_wh_id: 42,
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
    authorize({ dojoId, orgId, code, userToken, user: { id: 1 } }, (err, ret) => {
      expect(ret).to.be.eql({ ok: true });
      expect(senecaStub.act).to.have.been.calledTwice;
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(exportMock.webhook.create).to.have.been.calledOnce;
      done();
    });
  });

  lab.test('should return an http$ transport response if it\'s provided', (done) => {
    const dojoLoadMock = {
      id: dojoId,
    };
    senecaStub.act
      .withArgs({ role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId })
      .callsFake((args, cb) => {
        cb(null, dojoLoadMock);
      });
    exportMock.webhook.create = sinon.stub().callsFake(() => Promise.resolve({ http$: { status: 403 }, data: '' }));
    authorize({ dojoId, orgId, code, userToken, user: { id: 1 } }, (err, ret) => {
      expect(ret).to.be.eql({ http$: { status: 403 }, data: '' });
      expect(senecaStub.act).to.have.been.calledOnce;
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(exportMock.webhook.create).to.have.been.calledOnce;
      done();
    });
  });

  lab.test('should remove webhook if it exists', (done) => {
    // ARRANGE
    const dojoLoadMock = {
      id: dojoId,
      eventbriteToken: userToken,
      eventbriteWhId: 41,
    };
    const dojoSaveMock = {
      id: dojoId,
      eventbrite_token: userToken,
      eventbrite_wh_id: 42,
    };
    senecaStub.act
      .withArgs({ role: 'cd-dojos', entity: 'dojo', cmd: 'load', id: dojoId })
      .callsFake((args, cb) => {
        cb(null, dojoLoadMock);
      });
    exportMock.webhook.delete.callsFake((args) => {
      expect(args.id).to.equal(41);
      expect(args.token).to.equal(userToken);
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
    authorize({ dojoId, orgId, code, userToken, user: { id: 1 } }, (err, ret) => {
      expect(ret).to.be.eql({ ok: true });
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledTwice;
      expect(exportMock.webhook.delete).to.have.been.calledOnce;
      expect(exportMock.webhook.create).to.have.been.calledOnce;
      done();
    });
  });
});

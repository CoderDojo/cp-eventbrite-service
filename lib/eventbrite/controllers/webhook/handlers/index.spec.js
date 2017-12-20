exports.lab = require('lab').script();

const lab = exports.lab;
const chai = require('chai');

const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const fn = require('./index.js');

lab.experiment('Webhook/handlers', () => {
  let sandbox;
  let senecaStub;
  let handler;
  const apiUrl = 'http//eb.com/';
  lab.beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    senecaStub = {
      act: sandbox.stub(),
    };
    handler = fn().bind(senecaStub);
    done();
  });

  lab.experiment('checkWebhook', () => {
    lab.afterEach((done) => {
      sandbox.restore();
      done();
    });
    lab.test('should use the only dojo', (done) => {
      const payload = {
        webhook_id: 42,
        action: 'event.updated',
      };
      senecaStub.act
        .withArgs({
          role: 'cd-dojos',
          entity: 'dojo',
          cmd: 'search',
          query: { eventbriteWhId: payload.webhook_id },
        })
        .callsFake((args, cb) => {
          cb(null, [{ id: 1000 }]);
        });
      senecaStub.act
        .withArgs({
          role: 'cd-eventbrite',
          ctrl: 'webhook',
          cmd: 'eventHandler',
          config: payload,
          api_url: apiUrl,
          dojo: { id: 1000 },
        })
        .callsFake((args, cb) => {
          cb(null, { http$: { status: 200 } });
        });
      handler({ role: 'cd-eventbrite', api_url: apiUrl, config: payload }, (err, res) => {
        expect(res).to.eql({ http$: { status: 200 } });
        expect(senecaStub.act).to.have.been.calledTwice;
        // The fact that the 2nd stub worked mean we got the expected params
        done();
      });
    });
    lab.test('should return 410 if more than one dojo', (done) => {
      const payload = {
        webhook_id: 42,
        action: 'event.updated',
      };
      senecaStub.act
        .withArgs({
          role: 'cd-dojos',
          entity: 'dojo',
          cmd: 'search',
          query: { eventbriteWhId: payload.webhook_id },
        })
        .callsFake((args, cb) => {
          cb(null, [{ id: 1000 }, { id: 1001 }]);
        });
      handler({ role: 'cd-eventbrite', api_url: apiUrl, config: payload }, (err, res) => {
        expect(res.http$).to.include({ status: 410 });
        expect(senecaStub.act).to.have.been.calledOnce;
        done();
      });
    });
    lab.test('should return 410 if no dojo', (done) => {
      const payload = {
        webhook_id: 42,
        action: 'event.updated',
      };
      senecaStub.act
        .withArgs({
          role: 'cd-dojos',
          entity: 'dojo',
          cmd: 'search',
          query: { eventbriteWhId: payload.webhook_id },
        })
        .callsFake((args, cb) => {
          cb(null, []);
        });
      handler({ role: 'cd-eventbrite', api_url: apiUrl, config: payload }, (err, res) => {
        expect(res.http$).to.include({ status: 410 });
        expect(senecaStub.act).to.have.been.calledOnce;
        done();
      });
    });
  });
  lab.experiment('delegateWebhook', () => {
    lab.afterEach((done) => {
      sandbox.restore();
      done();
    });
    lab.test('should call the appropriate handler', (done) => {
      const payload = {
        webhook_id: 42,
        action: 'event.updated',
      };
      senecaStub.act
        .withArgs({
          role: 'cd-dojos',
          entity: 'dojo',
          cmd: 'search',
          query: { eventbriteWhId: payload.webhook_id },
        })
        .callsFake((args, cb) => {
          cb(null, [{ id: 1000 }]);
        });
      senecaStub.act
        .withArgs({
          role: 'cd-eventbrite',
          ctrl: 'webhook',
          cmd: 'eventHandler',
          config: payload,
          api_url: apiUrl,
          dojo: { id: 1000 },
        })
        .callsFake((args, cb) => {
          cb(null, { http$: { status: 200 } });
        });
      handler({ role: 'cd-eventbrite', api_url: apiUrl, config: payload }, (err, res) => {
        expect(res.http$).to.include({ status: 200 });
        expect(senecaStub.act).to.have.been.calledTwice;
        // Handler checking is done as part of params of the stub
        done();
      });
    });
    lab.test('should return 401 when no matching act is found', (done) => {
      const payload = {
        webhook_id: 42,
        action: 'event.bananized',
      };
      senecaStub.act
        .withArgs({
          role: 'cd-dojos',
          entity: 'dojo',
          cmd: 'search',
          query: { eventbriteWhId: payload.webhook_id },
        })
        .callsFake((args, cb) => {
          cb(null, [{ id: 1000 }]);
        });
      handler({ role: 'cd-eventbrite', api_url: apiUrl, config: payload }, (err, res) => {
        expect(res.http$).to.include({ status: 401 });
        expect(senecaStub.act).to.have.been.calledOnce;
        done();
      });
    });
  });
});

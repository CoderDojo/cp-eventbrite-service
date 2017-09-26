exports.lab = require('lab').script();

const lab = exports.lab;
const chai = require('chai');

const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const fn = require('./index.js');
const async = require('async');
const Promise = require('bluebird');

lab.experiment('webhook/eventHandler', () => {
  let sandbox;
  let senecaStub;
  let sync;
  let exportMock;
  const dojo = {
    id: 1000,
    eventbriteToken: 'access_token',
  };
  const apiUrl = 'http://eb.com/theevent';
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
      event: {
        get: sandbox.stub(),
      },
    };
    senecaStub.export.withArgs('cd-eventbrite/acts').returns(exportMock);
    sync = fn().bind(senecaStub);
    done();
  });

  lab.afterEach((done) => {
    sandbox.restore();
    sandbox.reset();
    done();
  });

  lab.test('should create a draft event', (cb) => {
    // ARRANGE
    const createdAt = new Date();
    const eventInfoMock = {
      eventbriteId: 2000,
      name: 'test EB-Event',
      createdAt,
      // The eventInfoMock being mocked withArgs, the test also ensure Z timezone is set
      dates: [{ startTime: '2017-08-29T17:00:00Z', endTime: '2017-08-29T19:00:00Z' }],
      status: 'saved',
      dojoId: 1000,
      type: 'one-off',
    };
    const eventbriteEventMock = {
      id: 2000,
      name: { text: 'test EB-Event' },
      created: createdAt,
      start: { local: '2017-08-29T17:00:00' },
      end: { local: '2017-08-29T19:00:00' },
    };
    exportMock.event.get.callsFake((args) => {
      expect(args.url).to.equal(apiUrl);
      expect(args.qs).to.eql({ expand: 'venue,ticket_classes' });
      expect(args.token).to.equal(dojo.eventbriteToken);
      return Promise.resolve(eventbriteEventMock);
    });
    senecaStub.act
      .withArgs({ role: 'cd-events', cmd: 'listEvents', query: { eventbriteId: 2000 } })
      .callsFake((args, done) => {
        done(null, []);
      });
    senecaStub.act
      .withArgs({
        role: 'cd-events',
        cmd: 'saveEvent',
        eventInfo: eventInfoMock,
      })
      .callsFake((args, done) => {
        done(null, args.eventInfo);
      });
    // ACT
    sync({ dojo, api_url: apiUrl }, (err, ret) => {
      expect(ret).to.be.eql({ http$: { status: 200 } });
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledTwice;
      expect(exportMock.event.get).to.have.been.calledOnce;
      cb();
    });
  });

  lab.experiment('addressToString', () => {
    lab.beforeEach((done) => {
      sandbox.restore();
      sandbox.reset();
      done();
    });
    lab.test('should concatenate fields in order', (cb) => {
      // ARRANGE
      const createdAt = new Date();
      const eventInfoMock = {
        eventbriteId: 2000,
        name: 'test EB-Event',
        createdAt,
        status: 'saved',
        dojoId: 1000,
        type: 'one-off',
        address: 'dat street,\nDublin,\nD1',
        city: { nameWithHierarchy: 'Dublin' },
      };
      const eventbriteEventMock = {
        id: 2000,
        name: { text: 'test EB-Event' },
        created: createdAt,
        venue: {
          address: {
            address_1: 'dat street',
            city: 'Dublin',
            postal_code: 'D1',
          },
        },
      };
      exportMock.event.get.callsFake((args) => {
        expect(args.url).to.equal(apiUrl);
        expect(args.qs).to.eql({ expand: 'venue,ticket_classes' });
        expect(args.token).to.equal(dojo.eventbriteToken);
        return Promise.resolve(eventbriteEventMock);
      });
      senecaStub.act
        .withArgs({ role: 'cd-events', cmd: 'listEvents', query: { eventbriteId: 2000 } })
        .callsFake((args, done) => {
          done(null, []);
        });
      senecaStub.act
        .withArgs({
          role: 'cd-events',
          cmd: 'saveEvent',
          eventInfo: eventInfoMock,
        })
        .callsFake((args, done) => {
          done(null, args.eventInfo);
        });
      // ACT
      sync({ dojo, api_url: apiUrl }, (err, ret) => {
        expect(ret).to.be.eql({ http$: { status: 200 } });
        expect(senecaStub.export).to.have.been.calledOnce;
        expect(senecaStub.act).to.have.been.calledTwice;
        expect(exportMock.event.get).to.have.been.calledOnce;
        cb();
      });
    });
  });

  lab.test('should update an event', (cb) => {
    // ARRANGE
    const createdAt = new Date();
    const eventInfoMock = {
      id: 3000,
      eventbriteId: 2000,
      name: 'test EB-Event',
      createdAt,
      status: 'saved',
      dojoId: 1000,
      description: 'Bring packed lunch ;)',
      type: 'one-off',
    };
    const eventbriteEventMock = {
      id: 2000,
      name: { text: 'test EB-Event' },
      created: createdAt,
    };
    exportMock.event.get.callsFake((args) => {
      expect(args.url).to.equal(apiUrl);
      expect(args.qs).to.eql({ expand: 'venue,ticket_classes' });
      expect(args.token).to.equal(dojo.eventbriteToken);
      return Promise.resolve(eventbriteEventMock);
    });
    senecaStub.act
      .withArgs({ role: 'cd-events', cmd: 'listEvents', query: { eventbriteId: 2000 } })
      .callsFake((args, done) => {
        done(null, [{ id: 3000, name: 'oldEventTest', description: 'Bring packed lunch ;)' }]);
      });
    senecaStub.act
      .withArgs({
        role: 'cd-events',
        cmd: 'saveEvent',
        eventInfo: eventInfoMock,
      })
      .callsFake((args, done) => {
        done(null, args.eventInfo);
      });
    // ACT
    sync({ dojo, api_url: apiUrl }, (err, ret) => {
      expect(ret).to.be.eql({ http$: { status: 200 } });
      expect(senecaStub.export).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledTwice;
      expect(exportMock.event.get).to.have.been.calledOnce;
      cb();
    });
  });
  lab.experiment('syncEvent statuses', () => {
    lab.beforeEach((done) => {
      sandbox.restore();
      sandbox.reset();
      done();
    });
    lab.test('should publish an event', (done) => {
      // ARRANGE
      const createdAt = new Date();
      const eventInfoMock = {
        id: 3000,
        eventbriteId: 2000,
        name: 'test EB-Event',
        createdAt,
        status: 'published',
        dojoId: 1000,
        description: 'Bring packed lunch ;)',
        type: 'one-off',
      };
      const eventbriteEventMock = {
        id: 2000,
        name: { text: 'test EB-Event' },
        created: createdAt,
      };
      async.each(
        ['live', 'started', 'ended', 'completed'],
        (status, eachCb) => {
          eventbriteEventMock.status = status;
          exportMock.event.get.callsFake((args) => {
            expect(args.url).to.equal(apiUrl);
            expect(args.qs).to.eql({ expand: 'venue,ticket_classes' });
            expect(args.token).to.equal(dojo.eventbriteToken);
            return Promise.resolve(eventbriteEventMock);
          });
          senecaStub.act
            .withArgs({ role: 'cd-events', cmd: 'listEvents', query: { eventbriteId: 2000 } })
            .callsFake((args, cb) => {
              cb(null, [
                { id: 3000, name: 'oldEventTest', description: 'Bring packed lunch ;)' },
              ]);
            });
          senecaStub.act
            .withArgs({
              role: 'cd-events',
              cmd: 'saveEvent',
              eventInfo: eventInfoMock,
            })
            .callsFake((args, cb) => {
              cb(null, args.eventInfo);
            });
          // ACT
          sync({ dojo, api_url: apiUrl }, (err, ret) => {
            // Counting here is dodgy since we're in a loop
            expect(ret).to.be.eql({ http$: { status: 200 } });
            eachCb();
          });
        },
        done,
      );
    });
    lab.test('should cancel an event', (done) => {
      // ARRANGE
      const createdAt = new Date();
      const eventInfoMock = {
        eventbriteId: 2000,
        name: 'test EB-Event',
        createdAt,
        status: 'cancelled',
        dojoId: 1000,
        type: 'one-off',
      };
      const eventbriteEventMock = {
        id: 2000,
        name: { text: 'test EB-Event' },
        created: createdAt,
        status: 'canceled',
      };
      exportMock.event.get.callsFake((args) => {
        expect(args.url).to.equal(apiUrl);
        expect(args.qs).to.eql({ expand: 'venue,ticket_classes' });
        expect(args.token).to.equal(dojo.eventbriteToken);
        return Promise.resolve(eventbriteEventMock);
      });
      senecaStub.act
        .withArgs({ role: 'cd-events', cmd: 'listEvents', query: { eventbriteId: 2000 } })
        .callsFake((args, cb) => {
          cb(null, []);
        });
      senecaStub.act
        .withArgs({
          role: 'cd-events',
          cmd: 'saveEvent',
          eventInfo: eventInfoMock,
        })
        .callsFake((args, cb) => {
          cb(null, args.eventInfo);
        });
      // ACT
      sync({ dojo, api_url: apiUrl }, (err, ret) => {
        expect(ret).to.be.eql({ http$: { status: 200 } });
        expect(senecaStub.export).to.have.been.calledOnce;
        expect(senecaStub.act).to.have.been.calledTwice;
        expect(exportMock.event.get).to.have.been.calledOnce;
        done();
      });
    });
  });

  lab.test('should return a 500 on error on multiple event with same ebId', (done) => {
    const eventbriteEventMock = {
      id: 2000,
      name: { text: 'test EB-Event' },
      created: new Date(),
    };
    senecaStub.act
      .withArgs({ role: 'cd-events', cmd: 'listEvents', query: { eventbriteId: 2000 } })
      .callsFake((args, cb) => {
        cb(null, [{ id: 100 }, { id: 200 }]);
      });
    exportMock.event.get.callsFake((args) => {
      expect(args.url).to.equal(apiUrl);
      expect(args.qs).to.eql({ expand: 'venue,ticket_classes' });
      expect(args.token).to.equal(dojo.eventbriteToken);
      return Promise.resolve(eventbriteEventMock);
    });
    sync({ dojo, api_url: apiUrl }, (err, res) => {
      expect(res.http$).to.include({ status: 500 });
      expect(exportMock.event.get).to.have.been.calledOnce;
      expect(senecaStub.act).to.have.been.calledOnce;
      done();
    });
  });
  lab.test('should return a 500 when EB event is not found', (done) => {
    exportMock.event.get.callsFake((args) => {
      expect(args.url).to.equal(apiUrl);
      expect(args.qs).to.eql({ expand: 'venue,ticket_classes' });
      expect(args.token).to.equal(dojo.eventbriteToken);
      return Promise.reject();
    });
    sync({ dojo, api_url: apiUrl }, (err, res) => {
      expect(res.http$).to.include({ status: 500 });
      expect(exportMock.event.get).to.have.been.calledOnce;
      done();
    });
  });
});

exports.lab = require('lab').script();

const lab = exports.lab;
const chai = require('chai');

const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');
const fn = require('./index');
const Promise = require('bluebird');

lab.experiment('Auth/get', () => {
  let sandbox;
  let senecaStub;
  let exportMock;
  let getOrganisations;
  const code = 'abcdefgh';

  lab.beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    senecaStub = {
      export: sandbox.stub(),
      log: {
        error: sandbox.stub(),
      },
    };
    exportMock = {
      auth: {
        get: sandbox.stub().callsFake((args) => {
          expect(args.pubKey).to.equal(process.env.EVENTBRITE_PUBLIC_KEY);
          expect(args.secKey).to.equal(process.env.EVENTBRITE_SECRET_KEY);
          expect(args.code).to.equal(code);
          return Promise.resolve({
            access_token: 'access_token',
          });
        }),
      },
      webhook: {
        get: sandbox.stub().callsFake((args) => {
          expect(args.token).to.equal('access_token');
          return Promise.resolve({
            organizations:
              [{ _type: 'organization',
                name: 'Raspberry Dojo',
                vertical: 'default',
                parent_id: null,
                locale: 'en_SG',
                image_id: null,
                id: '801521497943' }]
          });
        }),
      },
    };
    senecaStub.export.withArgs('cd-eventbrite/acts').returns(exportMock);
    getOrganisations = fn().bind(senecaStub);
    done();
  });

  lab.afterEach((done) => {
    sandbox.restore();
    done();
  });

  lab.test('should get a list of organisations', (done) => {
    process.env.EVENTBRITE_PUBLIC_KEY = 'publicKey';
    process.env.EVENTBRITE_SECRET_KEY = 'secretKey';

    getOrganisations({code}, (err, res) => {
      expect(err).to.not.exist;
      expect(res.organisations[0].name).to.equal('Raspberry Dojo');
      expect(res.organisations[0].id).to.equal('801521497943');
      expect(res.token).to.equal('access_token');
      expect(exportMock.auth.get).to.have.been.calledOnce;
      expect(exportMock.webhook.get).to.have.been.calledOnce;
      done();
    });
  });
});
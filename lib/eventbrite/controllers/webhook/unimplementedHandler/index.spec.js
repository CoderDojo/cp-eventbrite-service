exports.lab = require('lab').script();

const lab = exports.lab;
const chai = require('chai');

const expect = chai.expect;
chai.use(require('sinon-chai'));
const fn = require('./index.js');

lab.experiment('webhook/unimplementHandler', () => {
  let senecaStub;
  let handler;
  const dojo = {
    id: 1000,
    eventbriteToken: 'access_token',
  };
  lab.beforeEach((done) => {
    handler = fn().bind(senecaStub);
    done();
  });

  lab.test('should return 200', (done) => {
    // ACT
    handler({ dojo }, (err, ret) => {
      expect(ret).to.be.eql({ http$: { status: 200 } });
      done();
    });
  });
});

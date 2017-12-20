exports.lab = require('lab').script();

const lab = exports.lab;
const chai = require('chai');

const expect = chai.expect;
const fn = require('./index');

lab.experiment('Auth/app', () => {
  let authApp;
  lab.beforeEach((done) => {
    authApp = fn();
    done();
  });

  lab.test('should return the API public token if it exists', (done) => {
    // ARRANGE
    process.env.EVENTBRITE_PUBLIC_KEY = 'thisisaverypublickey';
    // ACT
    authApp({}, (err, val) => {
      expect(err).to.not.exist;
      expect(val).to.eql({
        token: process.env.EVENTBRITE_PUBLIC_KEY,
      });
      done();
    });
  });
  lab.test('should return an error if the API public token does not exists', (done) => {
    // ARRANGE
    delete process.env.EVENTBRITE_PUBLIC_KEY;
    // ACT
    authApp({}, (err) => {
      expect(err).to.exist;
      expect(err.toString()).to.eql('Error: Missing EventBrite Public Token');
      done();
    });
  });
});

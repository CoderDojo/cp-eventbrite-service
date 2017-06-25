'use strict';

var lab = exports.lab = require('lab').script();
var chai = require('chai');
var expect = chai.expect;
var fn = require('./index');

lab.experiment('Auth/app', function () {
  var authApp;
  lab.beforeEach(function (done) {
    authApp = fn();
    done();
  });

  lab.test('should return the API public token if it exists', function (done) {
    // ARRANGE
    process.env.EVENTBRITE_PUBLIC_KEY = 'thisisaverypublickey';
    // ACT
    authApp({}, function (err, val) {
      expect(err).to.not.exists;
      expect(val).to.eql({
        token: process.env.EVENTBRITE_PUBLIC_KEY
      });
      done();
    });
  });
  lab.test('should return an error if the API public token does not exists', function (done) {
    // ARRANGE
    delete process.env.EVENTBRITE_PUBLIC_KEY;
    // ACT
    authApp({}, function (err, val) {
      expect(err).to.exists;
      expect(err.toString()).to.eql('Error: Missing EventBrite Public Token');
      done();
    });
  });
});

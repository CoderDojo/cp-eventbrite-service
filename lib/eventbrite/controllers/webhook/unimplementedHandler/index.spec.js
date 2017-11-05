'use strict';

var lab = exports.lab = require('lab').script();
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));
var sinon = require('sinon');
var fn = require('./index.js');

lab.experiment('webhook/unimplementHandler', function () {
  var senecaStub;
  var handler;
  var dojo = {
    id: 1000,
    eventbriteToken: 'access_token'
  };
  lab.beforeEach(function (done) {
    handler = fn().bind(senecaStub);
    done();
  });

  lab.test('should return 200', function (done) {
    // ACT
    handler({ dojo: dojo }, function (err, ret) {
      expect(ret).to.be.eql({ http$: { status: 200 } });
      done();
    });
  });
});

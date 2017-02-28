var util = require('../util.test');
var proxy = require('../../lib');

describe('request', function() {
  before(function(done) {
    done();
  });

  it('#user', function(done) {
    proxy.ready().then(function(port) {
      done();
    });
  });
  it('#server', function(done) {
    proxy.ready().then(function(port) {
      done();
    });
  });
  it('#host', function(done) {
    proxy.ready().then(function(port) {
      done();
    });
  });
  it('#proxy', function(done) {
    proxy.ready().then(function(port) {
      done();
    });
  });
  it('#socks', function(done) {
    proxy.ready().then(function(port) {
      done();
    });
  });
  it('#mock', function(done) {
    proxy.ready().then(function(port) {
      done();
    });
  });
});

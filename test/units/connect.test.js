var util = require('../util.test');
var proxy = require('../../lib');

describe('connect', function() {
  before(function(done) {
    done();
  });

  it('#normal', function(done) {
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
});

var proxy = require('../../lib');

describe('connect', function() {
  before(function(done) {
    proxy.ready().then(function(port) {
      done();
    });
  });

  it('#normal', function(done) {

  });
  it('#host', function(done) {

  });
  it('#proxy', function(done) {

  });
  it('#socks', function(done) {

  });
});

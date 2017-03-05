require('./koa.test');
require('./express.test');

var util = require('./util.test');
var proxy = require('../lib');
before(function(done) {
  proxy.ready().then(function(port) {
      Promise.all([
        util.startHttpServer(),
        util.startProxyServer(),
        util.startSocksServer(),
        util.startSocketServer(),
      ]).then(function() {
        done();
      });
  });
});
require('./units/connect.test');
require('./units/request.test');

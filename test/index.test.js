require('./koa.test');
require('./express.test');

var util = require('./util.test');
var proxy = require('../lib');
beforeEach(function(done) {
  proxy.ready().then(function(port) {
      Promise.all([
        util.startHttpServer(),
        util.startProxyServer(),
        util.startSocksServer(),
      ]).then(done);
  });
});
require('./units/connect.test');
require('./units/request.test');
require('./units/rules.test');

require('./koa.test');
require('./express.test');

var proxy = require('../lib');
beforeEach(function(done) {
  proxy.ready().then(function(port) {
      done();
  });
});
require('./units/connect.test');
require('./units/request.test');
require('./units/rules.test');

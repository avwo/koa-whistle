var startWhistle = require('../../../github/whistle');
var path = require('path');
var proxyServer;

module.exports = function(options) {
  if (proxyServer) {
    return proxyServer;
  }
  var pluginPaths = [path.resolve(__dirname, 'plugins')];
  var storage = '.koa-whistle/' + options.name;
  if (typeof options.baseDir === 'string') {
    pluginPaths.push(path.join(options.baseDir, 'node_modules'));
  }
  var port = options.port;
  proxyServer = new Promise(function(resolve, reject) {
    startWhistle({
      port: port,
      pluginPaths: pluginPaths,
      storage: storage,
      rules: options.rules,
      values: options.values,
      username: options.username,
      password: options.password,
      sockets: options.sockets
    }, function() {
      options.hint !== false && console.log(options.hint || 'Visit http://127.0.0.1:%s/ to access whistle.', port);
      resolve(port);
    });
  });
  return proxyServer;
};

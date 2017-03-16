var startWhistle = require('whistle');
var path = require('path');
var isMaster = require('cluster').isMaster;

var proxyServer;

module.exports = function(options) {
  if (proxyServer) {
    return proxyServer;
  }
  if (process.env.KOA_WHISTLE_PORT) {
    proxyServer = new Promise(function(resolve) {
      setTimeout(function() {
        resolve(process.env.KOA_WHISTLE_PORT);
      }, 1000);
    });
    return proxyServer;
  }
  var pluginPaths = [path.resolve(__dirname, 'plugins')];
  var storage = '.koa-whistle/' + options.name;
  if (typeof options.baseDir === 'string') {
    pluginPaths.push(path.join(options.baseDir, 'node_modules'));
  }
  var port = options.port;
  if (isMaster) {
    process.env.KOA_WHISTLE_PORT = port;
  }
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
      if (options.hint !== false) {
        if (options.hint) {
          console.log(options.hint);
        } else {
          console.log('Visit http://127.0.0.1:%s/ to access whistle.', port);
        }
      }
      resolve(port);
    });
  });
  return proxyServer;
};

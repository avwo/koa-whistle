var startWhistle = require('../../../github/whistle');
var path = require('path');
var os = require('os');
var proxyServer;

function getHomedir() {
  //默认设置为`~`，防止Linux在开机启动时Node无法获取homedir
  return (typeof os.homedir == 'function' ? os.homedir() :
    process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']) || '~';
}

module.exports = function(options) {
  if (proxyServer) {
    return proxyServer;
  }
  var pluginPaths = [path.resolve(__dirname, 'plugins')];
  var storage = '.koa-whistle/' + options.name;
  if (typeof options.baseDir === 'string') {
    pluginPaths.push(path.join(options.baseDir, 'node_modules'));
  }
  proxyServer = new Promise(function(resolve, reject) {
    startWhistle({
      port: options.port,
      pluginPaths: pluginPaths,
      storage: storage,
      rules: options.rules,
      values: options.values
    }, function() {
      //TODO: 文案完善
      console.log('Visit http://127.0.0.1:%s/ to access whistle.', options.port);
      resolve(options.port);
    });
  });
  return proxyServer;
};

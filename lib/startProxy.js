var startWhistle = require('../../../github/whistle');
var http = require('http');
var path = require('path');
var os = require('os');
var curPort = 60000;

function getHomedir() {
  //默认设置为`~`，防止Linux在开机启动时Node无法获取homedir
  return (typeof os.homedir == 'function' ? os.homedir() :
    process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']) || '~';
}

function getServerPort(callback, defaultPort) {
  if (defaultPort > 0) {
    return callback(defaultPort);
  }
  var server = http.createServer();
  var port = curPort++;
  var next = function() {
    getServerPort(callback);
  };
  server.on('error', next);
  server.listen(port, function() {
    server.removeListener('error', next);
    server.close(function() {
      callback(port);
    });
  });
}

module.exports = function(options) {
    var pluginPaths = [path.resolve(__dirname, 'plugins')];
    var storage = path.resolve(getHomedir(), '.koa-whistle', options.name);
    if (typeof options.baseDir === 'string') {
        pluginPaths.push(path.join(options.baseDir, 'node_modules'));
    }
    return new Promise(function(resolve, reject) {
      getServerPort(function(port) {
        startWhistle({
            port:  port,
            pluginPaths: pluginPaths,
            storage: storage
        }, function() {
            resolve(this.address().port);
        });
      }, options.whistlePort);
    });
};

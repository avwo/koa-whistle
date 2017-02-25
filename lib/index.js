var startWhistle = require('../../../github/whistle');
var path = require('path');
var os = require('os');

function getHomedir() {
  //默认设置为`~`，防止Linux在开机启动时Node无法获取homedir
  return (typeof os.homedir == 'function' ? os.homedir() :
    process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']) || '~';
}

module.exports = function(options, callback) {
    var pluginPaths = [path.resolve(__dirname, 'plugins')];
    if (typeof options.baseDir === 'string') {
        pluginPaths.push(path.join(options.baseDir, 'node_modules'));
    }
    startWhistle({
        port: options.port || '0',
        pluginPaths: pluginPaths,
        storage: path.resolve(getHomedir(), '.koa-whistle', options.name)
    }, function() {
        callback(this.address().port);
    });
};

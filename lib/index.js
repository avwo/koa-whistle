var assert = require('assert');
var http = require('http');
var parse = require('parseurl');
var request = require('./request');
var startProxy = require('./startProxy');

var PORT_HEADER = 'x-koa-whistle-server-port';
var PROXY_HEADER = 'x-koa-whistle-proxy';
var SOCKS_HEADER = 'x-koa-whistle-socks';
var HTTPS_HEADER = 'x-whistle-https-request';
var resolveServer, config, PROXY_REQ_HEADER;
var defer = new Promise(function(resolve) {
  resolveServer = resolve;
});

function setProxy(headers, proxy) {
  if (!headers || !proxy || typeof proxy !== 'string') {
    return;
  }
  headers[PROXY_HEADER] = proxy;
}

function setSocks(headers, socks) {
  if (!headers || !socks || typeof socks !== 'string') {
    return;
  }
  headers[SOCKS_HEADER] = socks;
}

exports.start = function (options) {
  if (config) {
    return defer;
  }
  assert(options, 'argument options is required.');
  assert(options.port > 0, ' Integer argument options.port > 0 is required.');
  assert(options.serverPort > 0, ' Integer argument options.serverPort > 0 is required.');
  assert(options.name && typeof options.name === 'string', 'String argument options.name is required.');
  config = options;
  PROXY_REQ_HEADER = 'x-koa-whistle-' + encodeURIComponent(options.name) + '_' + Date.now();
  var res = startProxy(options);
  res.then(resolveServer).catch(function(err) {
    throw err;
  });
  return defer;
};

exports.getPortSync = function() {
  assert(config, 'start the server first.');
  return config.port;
};

exports.getPort = function() {
  return defer;
};

exports.intercept = function(req, res) {
  var headers = req.headers;
  if (headers[PROXY_REQ_HEADER]) {
    delete headers[PROXY_REQ_HEADER];
    delete headers[PORT_HEADER];
    delete headers[HTTPS_HEADER];
    return false;
  }

  headers[PORT_HEADER] = config.serverPort;
  headers[PROXY_REQ_HEADER] = 1;
  if (req.secure) {
    headers[HTTPS_HEADER] = 1;
  }
  return defer.then(function(port) {
    var options = parse(req);
    options.headers = req.headers;
    return new Promise(function(resolve, reject) {
      var _req = request(options, port, function(err, _res) {
        if (err) {
          return reject(err);
        }
        resolve(_res);
      });
      _req.on('error', reject);
      req.pipe(_req);
    });
  });
};

exports.createConnection =
  exports.createSocket = function(options) {
    var opts = {
      method: 'CONNECT',
      agent: false
    };
    if (typeof options === 'string') {
      opts.host = options;
      opts.port = arguments[1];
    }
    return new Promise(function(resolve, reject) {
      opts.headers = options.headers || {};
      opts.path = opts.headers.host
        = opts.host + (opts.port > 0 ? ':' + options.port : '');
      defer.then(function(port) {
        opts.host = '127.0.0.1';
        opts.port = port;
        var req = http.request(opts);
        req.once('connect', resolve);
        req.once('error', reject);
        req.end();
      });
    });
  };

exports.setProxy = setProxy;

exports.setSocks = setSocks;

exports.export = function(obj) {
  ['start', 'getPort', 'setProxy', 'setSocks', 'createConnection',
  'createSocket'].forEach(function(name) {
    obj[name] = exports[name];
  });
};

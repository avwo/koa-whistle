var assert = require('assert');
var http = require('http');
var parse = require('parseurl');
var request = require('./request');
var startProxy = require('./startProxy');

var PORT_HEADER = 'x-koa-whistle-server-port';
var HOST_HEADER = 'x-koa-whistle-host';
var PROXY_HEADER = 'x-koa-whistle-proxy';
var SOCKS_HEADER = 'x-koa-whistle-socks';
var HTTPS_HEADER = 'x-whistle-https-request';
var resolveServer, config, PROXY_REQ_HEADER;
var defer = new Promise(function(resolve) {
  resolveServer = resolve;
});

function checkArgs(headers, value) {
  if (!headers || !value || typeof value !== 'string') {
    return false;
  }
  value = value.trim();
  return !!value;
}

function setHost(headers, host) {
  if (checkArgs(headers, host)) {
    headers[HOST_HEADER] = decodeURIComponent(host);
  }
}

function setProxy(headers, proxy) {
  if (checkArgs(headers, proxy)) {
    headers[PROXY_HEADER] = decodeURIComponent(proxy);
  }
}

function setSocks(headers, socks) {
  if (checkArgs(headers, socks)) {
    headers[SOCKS_HEADER] = decodeURIComponent(socks);
  }
}

function setHttpsRequest(headers) {
  headers[HTTPS_HEADER] = 1;
}

function intercept(req, res) {
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
}

exports = module.exports = function (options) {
  if (config) {
    return intercept;
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
  return intercept;
};

exports.getPortSync = function() {
  return config.port;
};

exports.ready =
  exports.getPort = function() {
    return defer;
  };

exports.createConnection =
  exports.connect = function(options) {
    var opts = {
      method: 'CONNECT',
      agent: false
    };
    if (options > 0) {
      options = {
        port: options,
        host: arguments[1] || '127.0.0.1'
      };
    }
    return new Promise(function(resolve, reject) {
      var headers = opts.headers = options.headers || {};
      opts.path = headers.host
        = options.host + (options.port > 0 ? ':' + options.port : '');
      var rules = options.rules;
      if (rules) {
        setHost(headers, rules.host);
        setProxy(headers, rules.proxy);
        setSocks(headers, rules.socks);
      }
      defer.then(function(port) {
        opts.host = '127.0.0.1';
        opts.port = port;
        var req = http.request(opts);
        req.once('connect', function(req, socket) {
          resolve(socket);
        });
        req.once('error', reject);
        req.end();
      });
    });
  };

exports.setHost = setHost;
exports.setProxy = setProxy;
exports.setSocks = setSocks;
exports.setHttpsRequest = setHttpsRequest;

exports.export = function(obj) {
  ['ready', 'getPort', 'setHost', 'setProxy', 'setSocks',
  'createConnection', 'connect'].forEach(function(name) {
    obj[name] = exports[name];
  });
};

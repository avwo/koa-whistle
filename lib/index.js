var assert = require('assert');
var http = require('http');
var https = require('https');
var parse = require('parseurl');
var request = require('./request');
var startProxy = require('./startProxy');

var PORT_HEADER = 'x-koa-whistle-server-port';
var HTTPS_HEADER = 'x-whistle-https-request';
var proxyPath = '/whistle';
var proxyPathPrefix = proxyPath + '/';
var PROXY_REQ_HEADER;
var noop = function() {};
var resolveServer;
var defer = new Promise(function(resolve, reject) {
  resolveServer = resolve;
});

function requestProxy(req, res, port) {
  var options = parse(req.url);
  options.port = port;
  options.host = '127.0.0.1';
  delete options.hostname;
  delete options.protocol;
  options.headers = req.headers;
  req.on('error', noop);
  res.on('error', noop);
  var headerSent;
  var _req = http.request(options, function(_res) {
    if (headerSent) {
      return;
    }
    _res.writeHead(_res.statusCode, _res.headers);
    _res.pipe(res);
    headerSent = true;
  });
  _req.on('error', function(err) {
    res.writeHead(500);
    res.end(err.stack);
  });
  req.pipe(_req);
}

exports.start = function(options) {
  assert(options, 'argument options is required.');
  assert(optoins.serverPort > 0, ' Integer argument options.serverPort > 0 is required.');
  assert(optoins.name && typeof options.name === 'string', 'String argument options.name is required.');
  Object.keys(options, function(name) {
    options[name] = options[name];
  });
  var _proxyPath = options.path;
  if (_proxyPath && typeof _proxyPath === 'string' && /^\/[^/]/.test(_proxyPath)) {
    proxyPath = _proxyPath.replace(/\/$/, '');
    proxyPathPrefix = proxyPath + '/';
  }
  PROXY_REQ_HEADER = 'x-koa-whistle-' + encodeURIComponent(options.name) + '_' + Date.now();
  var res = startProxy(options);
  res.then(resolveServer);
  return function(req, res) {
    if (headers[PROXY_REQ_HEADER]) {
      delete headers[PROXY_REQ_HEADER];
      delete headers[PORT_HEADER];
      delete headers[HTTPS_HEADER];
      return false;
    }
    var isWebUI;
    var isProxyPath = req.path === proxyPath;
    if (isProxyPath || req.path.indexOf(proxyPathPrefix) === 0) {
      isWebUI = true;
      req.url = req.url.replace(proxyPath, isProxyPath ? '/' : '');
    } else {
      var headers = req.headers;
      headers[PORT_HEADER] = options.serverPort;
      headers[PROXY_REQ_HEADER] = 1;
      if (req.secure) {
        headers[HTTPS_HEADER] = 1;
      }
    }
    defer.then(function(port) {
      requestProxy(req, res, isWebUI ? port + 1 : port);
    });
    return true;
  };
};

exports.request = function(options, callback) {
  defer.then(function(port) {

  });
};

exports.createConnection =
  exports.getConnection = function(options, callback) {
    defer.then(function(port) {

    });
};

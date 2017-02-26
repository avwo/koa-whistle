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

exports.start = function(options) {
  assert(options, 'argument options is required.');
  assert(options.serverPort > 0, ' Integer argument options.serverPort > 0 is required.');
  assert(options.name && typeof options.name === 'string', 'String argument options.name is required.');
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
    var headers = req.headers;
    if (headers[PROXY_REQ_HEADER]) {
      delete headers[PROXY_REQ_HEADER];
      delete headers[PORT_HEADER];
      delete headers[HTTPS_HEADER];
      return false;
    }

    var pathname = parse(req).pathname;
    var isWebUI = pathname === proxyPath || pathname.indexOf(proxyPathPrefix) === 0;
    if (!isWebUI) {
      isWebUI = true;
      headers[PORT_HEADER] = options.serverPort;
      headers[PROXY_REQ_HEADER] = 1;
      if (req.secure) {
        headers[HTTPS_HEADER] = 1;
      }
    }
    return defer.then(function(port) {
      var options = parse(req);
      options.headers = req.headers;
      return new Promise(function(resolve, reject) {
        var _req = request(options, isWebUI ? port + 1 : port, function(err, _res) {
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

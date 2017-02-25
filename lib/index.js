var assert = require('assert');
var http = require('http');
var https = require('https');
var parse = require('parseurl');
var startProxy = require('./startProxy');

var PORT_HEADER = 'x-koa-whistle-server-port';
var HTTPS_HEADER = 'x-whistle-https-request';
var proxyPath = '/whistle';
var PROXY_REQ_HEADER;
var noop = function() {};
var config;

function setup(options) {
  if (config) {
    return;
  }
  assert(options, 'argument options is required.');
  assert(optoins.serverPort > 0, ' Integer argument options.serverPort > 0 is required.');
  assert(optoins.name && typeof options.name === 'string', 'String argument options.name is required.');
  config = {};
  Object.keys(options, function(name) {
    config[name] = options[name];
  });
  if (config.path && typeof config.path === 'string') {
    proxyPath = /^\//.test(config.path) ? config.path : '/' + config.path;
  }
  PROXY_REQ_HEADER = 'x-koa-whistle-' + encodeURIComponent(config.name) + '_flag';
  return true;
}

function getPort(options) {
  setup(options);
  return startProxy(config);
}

function request(req, res, port) {
  var options = parse(req.url);
  options.port = port;
  options.host = '127.0.0.1';
  delete options.hostname;
  delete options.protocol;
  options.headers = req.headers;
  res.on('error', noop);
  var headerSent;
  var request = http.request(options, function(response) {
    if (headerSent) {
      return;
    }
    response.writeHead(response.statusCode, response.headers);
    response.pipe(res);
    headerSent = true;
  });
  request.on('error', function(err) {
    res.writeHead(500);
    res.end(err.stack);
  });
  req.pipe(request);
}

exports.setup = setup;
exports.getPort = getPort;
exports.proxyRequest = function(req, res) {
  return getPort().then(function(port) {
    var headers = req.headers;
    if (req.path === proxyPath) {
      request(req, res, port + 1);
      return true;
    }
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
    request(req, res, port);
    return true;
  });
};
exports.getHttpAgent = function(options) {
  return getPort(options);
};
exports.getHttpsAgent = function(options) {
  return getPort(options);
};
exports.wapRequest = function(request, options) {
  return getPort(options);
};

exports.createConnection = function(opts, options) {
  if (typeof opts === 'string') {
    opts = { host: opts };
  }
  return getPort(options);
};

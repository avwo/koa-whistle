var assert = require('assert');
var http = require('http');
var startProxy = require('./startProxy');

var PORT_HEADER = 'x-koa-whistle-server-port';
var HTTPS_HEADER = 'x-whistle-https-request';
var PROXY_REQ_HEADER;
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
  PROXY_REQ_HEADER = 'x-koa-whistle-' + encodeURIComponent(config.name) + '_flag';
  return true;
}

function getPort(options) {
  setup(options);
  return startProxy(config);
}

exports.setup = setup;
exports.getPort = getPort;
exports.proxyRequest = function(req, res) {
  return getPort().then(function(port) {
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
    return true;
  });
};
exports.getHttpAgent = function(options) {
  return getPort(options);
};
exports.getHttpsAgent = function(options) {
  return getPort(options);
};
exports.warRequest = function(request, options) {
  return getPort(options);
};

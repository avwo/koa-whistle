/**
 * TODO: 支持timeout功能，只传url等功能，参考request
 */
var http = require('http');
var parseUrl = require('url').parse;

var HTTPS_HEADER = 'x-whistle-https-request';

module.exports = function(options, port, callback) {
  if (typeof options === 'string') {
    options = parseUrl(options);
  }
  var headers = options.headers = options.headers || {};
  if (!headers.host) {
    var host = options.host = options.hostname || options.host;
    if (host && typeof host === 'string') {
      if (host.indexOf(':') === -1) {
        headers.host = host + (options.port > 0 ? ':' + options.port : '');
      } else {
        headers.host = host;
      }
    } else {
      headers.host = '127.0.0.1';
    }
  }
  if (options.protocol === 'https') {
    headers[HTTPS_HEADER] = 1;
  }
  delete options.protocol;
  delete options.hostname;
  options.host = '127.0.0.1';
  options.port = port;
  try {
    return http.request(options, function(res) {
      callback(null, res);
    });
  } catch(err) {
    process.nextTick(function() {
      callback(err);
    });
  }
};

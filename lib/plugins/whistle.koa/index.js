var PORT_HEADER = 'x-koa-whistle-server-port';
var HOST_HEADER = 'x-koa-whistle-host';
var PROXY_HEADER = 'x-koa-whistle-proxy';
var SOCKS_HEADER = 'x-koa-whistle-socks';
var noop = function() {};

function handleRequest(req, res, options) {
  res.on('error', noop);
  var headers = req.headers;
  if (headers[options.CUR_HOST_HEADER] || headers[options.CUR_PROXY_HEADER]) {
    return res.end();
  }
  var fullUrl = decodeURIComponent(headers[options.FULL_URL_HEADER]);
  if (headers[HOST_HEADER]) {
    return res.end(fullUrl + ' ' + decodeURIComponent(headers[HOST_HEADER]));
  }
  if (headers[PROXY_HEADER]) {
    return res.end(fullUrl + ' proxy://' + decodeURIComponent(headers[PROXY_HEADER]));
  }
  if (headers[SOCKS_HEADER]) {
    return res.end(fullUrl + ' socks://' + decodeURIComponent(headers[SOCKS_HEADER]));
  }
  if (headers[PORT_HEADER]) {
    return res.end(fullUrl + ' 127.0.0.1:' + headers[PORT_HEADER]);
  }
  res.end();
}

exports.pluginRulesServer = function(server, options) {
  server.on('request', function(req, res) {
    handleRequest(req, res, options);
  });
};

var PORT_HEADER = 'x-koa-whistle-server-port';
var PROXY_HEADER = 'x-koa-whistle-proxy';
var SOCKS_HEADER = 'x-koa-whistle-socks';
var noop = function() {};

function handleRequest(req, res, options) {
    res.on('error', noop);
    var headers = req.headers;
    if (headers[options.LOCAL_HOST_HEADER]) {
      return res.end();
    }
    if (headers[PORT_HEADER]) {
      return res.end('/./ 127.0.0.1:' + headers[PORT_HEADER]);
    }
    if (headers[PROXY_HEADER]) {
      return res.end('/./ ' + headers[PROXY_HEADER]);
    }
    if (headers[SOCKS_HEADER]) {
      return res.end('/./ ' + headers[SOCKS_HEADER]);
    }
    res.end();
}

exports.rulesServer = function(server, options) {
    server.on('request', function(req, res) {
        handleRequest(req, res, options);
    });
};

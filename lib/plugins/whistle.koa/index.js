var PORT_HEADER = 'x-koa-whistle-server-port';
var noop = function() {};

function handleRequest(req, res, options) {
    res.on('error', noop);
    var headers = req.headers;
    if (headers[options.LOCAL_HOST_HEADER] || headers[PORT_HEADER]) {
      return res.end();
    }
    res.end('/./ 127.0.0.1:' + headers[PORT_HEADER]);
}

exports.rulesServer = function(server, options) {
    server.on('request', function(req, res) {
        handleRequest(req, res, options);
    });
};

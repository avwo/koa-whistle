var HOST_HEADER = 'x-koa-whistle-host';
var noop = function() {};

function handleRequest(req, res, options) {
    res.on('error', noop);
    if (req.headers[options.LOCAL_HOST_HEADER] || req.headers[HOST_HEADER]) {
      return res.end();
    }
    res.end('/./ ' + req.headers[HOST_HEADER]);
}

exports.rulesServer = function(server, options) {
    server.on('request', function(req, res) {
        handleRequest(req, res, options);
    });
};

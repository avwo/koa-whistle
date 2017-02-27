var proxy = require('./lib');

module.exports = function (options) {
  proxy.start(options);
  var intercept = proxy.intercept;
  return function (req, res, next) {
    var defer = intercept(req, res);
    if (!defer) {
      return next();
    }
    req.on('error', next);
    res.on('error', next);
    defer.then(function(_res) {
      res.writeHead(_res.statusCode, _res.headers);
      _res.pipe(res);
      _res.on('error', function() {
        res.destroy();
      });
    }, function(err) {
      res.status(500).send(err.stack);
    });
  };
};

proxy.export(module.exports);

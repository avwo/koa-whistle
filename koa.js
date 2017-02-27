var proxy = require('./lib');

module.exports = function (options) {
  proxy.start(options);
  var intercept = proxy.intercept;
  return function* (next) {
    var res = intercept(this.req, this.res);
    if (!res) {
      return yield next;
    }
    res = yield res;
    this.status = res.statusCode;
    this.set(res.headers);
    this.body = res;
  };
};

proxy.export(module.exports);

var proxy = require('./lib');

module.exports = function (options) {
  var intercept = proxy.start(options);
  return function* (next) {
    var res = intercept(this.req, this.res);
    if (!res) {
      return yield next;
    }
    res = yield res;
    this.status = res.statusCode;
    this.headers = res.headers;
    this.body = res;
  };
};


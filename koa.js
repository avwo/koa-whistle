var proxy = require('./lib');

module.exports = function (options) {
  var intercept = proxy.start(options);
  return function* (next) {
    if (!intercept(this.req, this.res)) {
      yield next;
    }
  };
};


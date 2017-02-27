var proxy = require('./lib');

module.exports = function (options) {
  var intercept = proxy(options);
  return async (ctx, next) => {
    var res = intercept(ctx.req, ctx.res);
    if (!res) {
      return await next();
    }
    res = await res;
    ctx.status = res.statusCode;
    ctx.set(res.headers);
    ctx.body = res;
  };
};

proxy.export(module.exports);

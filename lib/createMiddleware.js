const { getFilter } = require('./util');
const getIntercept = require('./intercept');

module.exports = (options, filter, proxy) => {
  const intercept = getIntercept(options);
  const middleware = async (ctx, next) => {
    filter = getFilter(options, filter);
    let res = filter && await filter(ctx.req);
    if (res !== false) {
      res = intercept(ctx.req, ctx.res);
    }
    if (res === false) {
      return await next();
    }
    res = await res;
    ctx.status = res.statusCode;
    ctx.set(res.headers);
    if (res.pipe) {
      ctx.body = res;
    }
  };
  Object.assign(middleware, proxy);
  return middleware;
};

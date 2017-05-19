const { getFilter } = require('./util');
const getIntercept = require('./intercept');

module.exports = (options, filter, proxy) => {
  const intercept = getIntercept(options);
  filter = getFilter(options, filter);
  const middleware = async (ctx, next) => {
    let res = intercept(ctx.req, filter);
    if (res !== false) {
      res = await res;
    }
    if (res === false) {
      return await next();
    }
    ctx.status = res.statusCode;
    ctx.set(res.headers);
    if (res.pipe) {
      ctx.body = res;
    }
  };
  Object.assign(middleware, proxy);
  return middleware;
};

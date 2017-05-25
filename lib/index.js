const startWhistle = require('./start');
const util = require('./util');
const getIntercept = require('./intercept');

const loadModule = require;

exports.getServerIp = util.getServerIp;
exports.getRandomPort = util.getPort;
exports.startWhistle = exports.startProxy = startWhistle;
exports.isRunning = util.isRunning;

exports.getProxy = util.getProxy;
exports.request = (options, cb) => util.getProxy().request(options, cb);
exports.connect = (options, cb) => util.getProxy().connect(options, cb);
exports.proxyRequest = (...args) => util.getProxy().proxyRequest.apply(null, args);


exports.createKoa2Middleware = exports.createMiddleware = (options, filter) => {
  const middleware = loadModule('./createMiddleware')(options, filter, util.getProxy(options));
  Object.assign(middleware, util.getProxy(options));
  return middleware;
};

exports.createKoaMiddleware = (options, filter) => {
  const intercept = getIntercept(options);
  filter = util.getFilter(options, filter);
  const middleware = function* (next) {
    let res = intercept(this.req, filter);
    if (res !== false) {
      res = yield res;
    }
    if (res === false) {
      return yield next;
    }
    this.status = res.statusCode;
    this.set(res.headers);
    if (res.pipe) {
      this.body = res;
    }
  };
  Object.assign(middleware, util.getProxy(options));
  return middleware;
};

exports.createExpressMiddleware = (options, filter) => {
  const intercept = getIntercept(options);
  filter = util.getFilter(options, filter);
  const middleware = (req, res, next) => {
    const result = intercept(req, filter);
    const errorHandler = () => res.destroy();
    if (result === false) {
      req.removeListener('error', errorHandler);
      res.removeListener('error', errorHandler);
      return next();
    }
    req.on('error', errorHandler);
    res.on('error', errorHandler);
    result.then((_res) => {
      if (_res === false) {
        return next();
      }
      res.writeHead(_res.statusCode, _res.headers);
      if (_res.pipe) {
        _res.pipe(res);
        _res.on('error', errorHandler);
      } else {
        res.end();
      }
    }, err => res.status(500).send(err.stack));
  };
  Object.assign(middleware, util.getProxy(options));
  return middleware;
};

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

exports.createKoa2Middleware = exports.createMiddleware = (options, filter) => {
  const middleware = loadModule('./createMiddleware')(options, filter, util.getProxy(options));
  Object.assign(middleware, util.getProxy(options));
  return middleware;
};

exports.createKoaMiddleware = (options, filter) => {
  const intercept = getIntercept(options);
  filter = util.getFilter(options, filter);
  const middleware = function* (next) {
    let res = filter;
    if (res) {
      res = yield filter(this.req);
    }
    if (res !== false) {
      res = intercept(this.req, this.res);
    }
    if (res === false) {
      return yield next;
    }
    res = yield res;
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
  const execFilter = (req, callback) => {
    if (filter) {
      filter(req).then(callback);
    } else {
      callback(true);
    }
  };
  const middleware = (req, res, next) => {
    execFilter(req, (result) => {
      if (result !== false) {
        result = intercept(req);
      }
      if (result === false) {
        return next();
      }
      const errorHandler = () => res.destroy();
      req.on('error', errorHandler);
      res.on('error', errorHandler);
      result.then((_res) => {
        res.writeHead(_res.statusCode, _res.headers);
        if (_res.pipe) {
          _res.pipe(res);
          _res.on('error', errorHandler);
        } else {
          res.end();
        }
      }, err => res.status(500).send(err.stack));
    });
  };
  Object.assign(middleware, util.getProxy(options));
  return middleware;
};

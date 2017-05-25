const assert = require('assert');
const http = require('http');
const r = require('request');
const os = require('os');
const Stream = require('stream');
const url = require('url');
const parseurl = require('parseurl');
const PassThrough = require('stream').PassThrough;
const co = require('co');

const cache = {};
const DEFAULT_NAME = 'koa-whistle';
const WHISTLE_RULES_HEADER = 'x-whistle-rules';
const WHISTLE_VALUES_HEADER = 'x-whistle-values';
const WHISTLE_POLICY_HEADER = 'x-whistle-policy';

let defaultOptions;
const getDefaultOptions = () => {
  if (defaultOptions) {
    return defaultOptions;
  }
  const options = process.env.KOA_WHISTLE_OPTIONS;
  if (!options) {
    return {};
  }
  defaultOptions = JSON.parse(options);
  return defaultOptions;
};

const ifaces = os.networkInterfaces();
exports.getServerIp = () => {
  const keys = Object.keys(ifaces);
  for (let i = 0; i < keys.length; i++) {
    const iface = ifaces[keys[i]];
    const ifaceKeys = Object.keys(iface);
    for (let j = 0; j < ifaceKeys.length; j++) {
      const item = iface[ifaceKeys[j]];
      if (!item.internal && item.family === 'IPv4') {
        return item.address;
      }
    }
  }
  return '127.0.0.1';
};

exports.isRunning = () => !!process.env.KOA_WHISTLE_OPTIONS;

exports.DEFAULT_NAME = DEFAULT_NAME;
exports.WHISTLE_RULES_HEADER = WHISTLE_RULES_HEADER;
exports.WHISTLE_VALUES_HEADER = WHISTLE_VALUES_HEADER;
exports.WHISTLE_POLICY_HEADER = WHISTLE_POLICY_HEADER;


let port = 40000;
const getPort = (callback) => {
  ++port;
  if (port % 10 === 0) {
    ++port;
  }
  const server = http.createServer();
  server.on('error', () => getPort(callback));
  server.listen(port, () => {
    server.removeAllListeners();
    server.close(() => {
      callback(port);
    });
  });
};

exports.getPort = () => {
  return new Promise(resolve => getPort(resolve));
};

const normalizeOptions = (options) => {
  if (options instanceof Stream) {
    const req = options;
    options = parseurl(req);
    options.rules = req.rules;
    options.values = req.values;
    options.protocol = req.protocol;
    options.headers = req.headers || {};
    options.method = req.method;
    options.body = req;
    delete options.protocol;
    const isHttps = req.socket && req.socket.encrypted;
    options.uri = `http${isHttps ? 's' : ''}://${req.headers.host}${options.path}`;
    options.body = req;
    return options;
  }
  if (typeof options === 'string') {
    options = { uri: options };
  }
  let uri = options.uri || options.url;
  delete options.url;
  if (!uri) {
    uri = options.uri = options;
  } else if (typeof uri === 'string') {
    uri = options.uri = url.parse(uri);
  }
  if (!options.headers) {
    options.headers = {};
  }
  delete options.protocol;
  return options;
};

const setRules = (options) => {
  let rules = options.rules;
  let values;
  if (Array.isArray(rules)) {
    rules = rules.join('\n');
  } else if (typeof rules !== 'string') {
    rules = '';
  }
  if (options.values && typeof options.values === 'object') {
    try {
      values = JSON.stringify(options.values);
    } catch (e) {
      /* eslint-disable not-empty */
      /* eslint-enable not-empty */
    }
  }
  let whistleRules = options.headers[WHISTLE_RULES_HEADER];
  if (typeof whistleRules !== 'string') {
    whistleRules = '';
  } else {
    whistleRules = decodeURIComponent(whistleRules);
  }
  if (whistleRules || rules) {
    options.headers[WHISTLE_RULES_HEADER] = encodeURIComponent(`${whistleRules}\n${rules}`);
  } else {
    delete options.headers[WHISTLE_RULES_HEADER];
  }
  if (values) {
    options.headers[WHISTLE_VALUES_HEADER] = encodeURIComponent(values);
  }
};

let hackDone;
const hackRequestForProxy = () => {
  if (hackDone) {
    return;
  }
  hackDone = true;
  const initRequest = r.Request.prototype.init;
  r.Request.prototype.init = function (options) {
    options = options || {};
    options.proxyHeaderWhiteList = [WHISTLE_POLICY_HEADER];
    initRequest.call(this, options);
  };
};
const getRequest = (opts) => {
  hackRequestForProxy();
  const request = r.defaults({
    proxy: `http://${opts.proxyHost}:${opts.proxyPort}`,
    headers: { [WHISTLE_POLICY_HEADER]: 'intercept' },
  });
  return (options, cb) => {
    options = normalizeOptions(options);
    setRules(options);
    return new Promise((resolve, reject) => {
      if (!cb) {
        options.encoding = null;
        const transform = new PassThrough();
        const res = request(options);
        res.pipe(transform);
        res.on('error', reject);
        res.on('response', (response) => {
          res.on('error', err => transform.emit('error', err));
          transform.statusCode = response.statusCode;
          transform.headers = response.headers;
          resolve(transform);
        });
        return;
      }
      request(options, (err, res, body) => {
        if (typeof cb === 'function') {
          cb(err, res, body);
        }
        if (err) {
          reject(err);
        } else {
          res.body = body;
          resolve(res);
        }
      });
    });
  };
};

const getConnect = (opts) => {
  const proxyConf = {
    proxyPort: opts.proxyPort,
    proxyHost: opts.proxyHost,
    method: 'CONNECT',
    agent: false,
  };

  return (options) => {
    if (options) {
      options = {
        host: options.host || options.hostname,
        port: options.port,
        headers: options.headers,
        rules: options.rules,
        values: options.values,
      };
    }
    options = Object.assign({}, options, proxyConf);
    const headers = options.headers = options.headers || {};
    const path = (options.host || '127.0.0.1') + (options.port > 0 ? `:${options.port}` : '');
    options.path = headers.host = path;
    options.host = proxyConf.proxyHost;
    options.port = proxyConf.proxyPort;
    headers[WHISTLE_POLICY_HEADER] = 'tunnel';
    setRules(options);
    return new Promise((resolve, reject) => {
      const req = http.request(options);
      req.once('connect', (_, socket) => {
        resolve(socket);
      });
      req.once('error', reject);
      req.end();
    });
  };
};

const getHost = (host) => {
  if (!host || typeof host !== 'string') {
    return '127.0.0.1';
  }
  return host;
};
exports.getHost = getHost;

const normalizeProxyOptions = (options) => {
  options = Object.assign({}, getDefaultOptions(), options);
  assert(options.proxyPort > 0, 'argument options.proxyPort > 0 is required.');
  options.proxyHost = getHost(options.proxyHost);
  return options;
};

exports.getFilter = (options, filter) => {
  if (typeof options === 'function') {
    return co.wrap(options);
  } else if (typeof filter === 'function') {
    return co.wrap(filter);
  } else if (options && typeof options.filter === 'function') {
    return co.wrap(options.filter);
  }
};

exports.getProxy = (options) => {
  options = normalizeProxyOptions(options);
  const host = `${options.proxyHost}:${options.proxyPort}`;
  let proxy = cache[host];
  if (!proxy) {
    proxy = cache[host] = {
      request: getRequest(options),
      connect: getConnect(options),
    };
  }
  return proxy;
};


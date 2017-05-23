const assert = require('assert');
const parseurl = require('parseurl');
const util = require('./util');

const PATHNAME = '/whistle';
const { WHISTLE_POLICY_HEADER, DEFAULT_NAME, WHISTLE_RULES_HEADER } = util;

const getPathname = (pathname) => {
  if (typeof pathname !== 'string' || !pathname) {
    return PATHNAME;
  }
  // 支持通过设置pathname = '?' 来禁用
  // pathname = pathname.replace(/[#?].*/, '');
  pathname = pathname.replace(/^\/|\/$/g, '');
  if (!pathname) {
    return PATHNAME;
  }
  return `/${pathname}`;
};
const normalizeOptions = (options) => {
  options = Object.assign({}, options);
  options.pathname = getPathname(options.pathname);
  assert(options.serverPort > 0, ' Integer options.serverPort > 0 is required.');
  options.serverHost = util.getHost(options.serverHost);
  if (!options.name || typeof options.name !== 'string') {
    options.name = DEFAULT_NAME;
  } else {
    options.name = encodeURIComponent(options.name);
  }
  options.host = `host://${options.serverHost}:${options.serverPort}`;
  return options;
};

module.exports = (options) => {
  options = normalizeOptions(options);
  const pathname = options.pathname;
  const absPath = `${pathname}/`;
  const relPath = `${pathname.slice(pathname.lastIndexOf('/') + 1)}/`;
  const PROXY_ID_HEADER = `x-${options.name}-${Date.now()}`;
  const request = util.getProxy(options).request;
  const { rules, values } = options;

  return (req, filter) => {
    const headers = req.headers;
    if (headers[PROXY_ID_HEADER]) {
      delete headers[WHISTLE_RULES_HEADER];
      delete headers[WHISTLE_POLICY_HEADER];
      return false;
    }
    const opts = parseurl(req);
    const fullUrl = (headers.host || opts.host) + opts.path;
    headers[WHISTLE_RULES_HEADER] = encodeURIComponent(`${fullUrl} ${options.host}`);
    headers[PROXY_ID_HEADER] = 1;
    if (opts.pathname === pathname) {
      return Promise.resolve({
        statusCode: 302,
        headers: { location: `${relPath}${opts.search || ''}` },
      });
    }
    const path = opts.path;
    let isWhistleUI;
    if (path.indexOf(absPath) === 0) {
      req.url = path.replace(pathname, '');
      req.headers.host = 'local.wproxy.org';
      isWhistleUI = true;
    } else {
      req.rules = rules;
      req.values = values;
    }
    if (isWhistleUI || !filter) {
      return request(req);
    }
    return filter(req).then((result) => {
      return result === false ? false : request(req);
    });
  };
};

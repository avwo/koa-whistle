const assert = require('assert');
const path = require('path');
const startWhistle = require('whistle');

const start = (options) => {
  return new Promise((resolve) => {
    startWhistle(options, resolve);
  });
};

module.exports = (options) => {
  options = options || {};
  let { name, port } = options;
  assert(name && typeof name === 'string', 'string options.name is required.');
  assert(port > 0, 'integer options.port > 0 is required.');
  process.env.KOA_WHISTLE_OPTIONS = JSON.stringify({ name, proxyPort: port });
  const pluginPaths = [path.resolve(__dirname, '../node_modules')];
  const storage = `.koa-whistle/${name}`;
  if (typeof options.baseDir === 'string') {
    pluginPaths.push(path.resolve(options.baseDir, 'node_modules'));
  }
  return start({
    port,
    storage,
    pluginPaths,
    rules: options.rules,
    values: options.values,
    username: options.username,
    password: options.password,
    sockets: options.sockets,
  });
};

const Koa = require('koa');
const fs = require('fs');
const https = require('https');
const path = require('path');
const proxy = require('../lib');
const { PATHNAME } = require('./util.test');

const rules = [];
const values = {
  'index.html': 'index.html',
  'test.json': 'test.json',
};
rules.push('//www.test.com/index.html file://{index.html}');
rules.push('//www.test.com/cgi-bin/get file://{test.json}');

const getBody = () => {
  return Promise.resolve('koa');
};

module.exports = () => {
  const certOpts = {
    key: fs.readFileSync(path.join(__dirname, 'assets/certs/root.key')),
    cert: fs.readFileSync(path.join(__dirname, 'assets/certs/root.crt')),
  };
  const app = new Koa();
  const serverPort = 7001;

  app.use(proxy.createKoaMiddleware({ serverPort, rules, values, pathname: PATHNAME }));
  app.use(function* () {
    this.body = yield getBody(); // For eslint
  });
  const server = https.createServer(certOpts);
  server.on('request', app.callback());
  return new Promise((resolve) => {
    server.listen(serverPort, () => {
      resolve(serverPort);
    });
  });
};

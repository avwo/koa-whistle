const assert = require('assert');
const path = require('path');
const request = require('request');
const proxy = require('../lib');
const util = require('./util.test');
const koaServer = require('./koa.test');
const expressServer = require('./express.test');

const baseDir = path.join(__dirname, '../');

before((done) => {
  proxy.getRandomPort().then((port) => {
    Promise.all([
      proxy.startWhistle({ port, baseDir, name: 'test-koa-whistle' }),
      util.startHTTPServer(),
      util.startHTTPsServer(),
      util.startSocketServer(),
    ]).then(() => done);
  });
});

describe('#connect', () => {
  it('proxy.connect', (done) => {
    proxy.connect({
      host: 'www.test.com',
      rules: `www.test.com 127.0.0.1:${util.socketServerPort}`,
    }).then((socket) => {
      socket.on('data', (data) => {
        assert(`${data}` === 'socket', 'Expected to return string socket.');
        done();
      });
    });
  });
});

describe('#request', () => {
  it('https proxy.request(options, cb)', (done) => {
    proxy.request({
      url: 'https://www.test.com/index.html',
      rules: [`www.test.com 127.0.0.1:${util.httpsServerPort}`],
    }, (err, res, body) => {
      assert(body === 'HTTPs', 'Expected to return string HTTPs.');
      done();
    });
  });
  it('https proxy.request(options)', (done) => {
    proxy.request({
      url: 'https://www.test.com/index.html',
      rules: `www.test.com 127.0.0.1:${util.httpsServerPort}`,
    }).then((res) => {
      res.on('data', (data) => {
        assert(`${data}` === 'HTTPs', 'Expected to return string HTTPs.');
        done();
      });
    });
  });
  it('http proxy.request(options, cb)', (done) => {
    proxy.request({
      url: 'http://www.test.com/index.html',
      rules: `www.test.com 127.0.0.1:${util.httpServerPort}`,
    }, (err, res, body) => {
      assert(body === 'HTTP', 'Expected to return string HTTP.');
      done();
    });
  });
  it('http proxy.request(options,)', (done) => {
    proxy.request({
      url: 'http://www.test.com/index.html',
      method: 'post',
      rules: [`www.test.com 127.0.0.1:${util.httpServerPort}`],
    }).then((res) => {
      res.on('data', (data) => {
        assert(`${data}` === 'HTTP', 'Expected to return string HTTP.');
        done();
      });
    });
  });
});

describe('#koa middleware', () => {
  let koaPort;
  before((done) => {
    koaServer().then((port) => {
      koaPort = port;
      done();
    });
  });
  it('request', (done) => {
    request(`https://127.0.0.1:${koaPort}`, (err, res, body) => {
      assert(body === 'koa', 'Expected to return string koa.');
      done();
    });
  });
  it('whistle', (done) => {
    request(`https://127.0.0.1:${koaPort}${util.PATHNAME}`, (err, res, body) => {
      assert(/<script/.test(body), 'Expected to return whistle ui.');
      done();
    });
  });
  it('by domain', (done) => {
    request(util.formatOptions({
      url: 'https://www.test.com/index.html',
      host: '127.0.0.1',
      port: koaPort,
    }), (err, res, body) => {
      assert(body === 'index.html', 'Expected to return string koa.');
      done();
    });
  });
  it('1. not match', (done) => {
    request(util.formatOptions({
      url: 'https://www.test.com/index2.html',
      host: '127.0.0.1',
      port: koaPort,
    }), (err, res, body) => {
      assert(body === 'koa', 'Expected to return string koa.');
      done();
    });
  });
  it('2. not match', (done) => {
    request(util.formatOptions({
      url: 'https://www.test.com/cgi-bin/get2',
      host: '127.0.0.1',
      port: koaPort,
    }), (err, res, body) => {
      assert(body === 'koa', 'Expected to return string koa.');
      done();
    });
  });
});

describe('#express middleware', () => {
  let expressPort;
  before((done) => {
    expressServer().then((port) => {
      expressPort = port;
      done();
    });
  });
  it('request', (done) => {
    request({
      uri: `http://127.0.0.1:${expressPort}`,
      method: 'post',
    }, (err, res, body) => {
      assert(body === 'express', 'Expected to return string express.');
      done();
    });
  });
  it('whistle', (done) => {
    request(`http://127.0.0.1:${expressPort}${util.PATHNAME}`, (err, res, body) => {
      assert(/<script/.test(body), 'Expected to return whistle ui page.');
      done();
    });
  });
  it('by domain', (done) => {
    request(util.formatOptions({
      url: 'http://www.test.com/cgi-bin/get2',
      host: '127.0.0.1',
      port: expressPort,
    }), (err, res, body) => {
      assert(body === 'express', 'Expected to return string express.');
      done();
    });
  });
});

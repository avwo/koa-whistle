var assert = require('assert');
var proxy = require('../../lib');
var util = require('../util.test');

describe('connect', function() {
  it('#default', function(done) {
    proxy.connect(util.socketServerPort)
      .then(function(socket) {
        socket.on('data', function(data) {
          assert('socket' === data + '');
          done();
        });
      });
  });
  it('#host', function(done) {
    proxy.connect({
      port: 1234,
      host: 'host.koa-whistle.com',
      rules: { host: '127.0.0.1:' + util.socketServerPort }
    }).then(function(socket) {
        socket.on('data', function(data) {
          assert('socket' === data + '');
          done();
        });
      });
  });
  it('#proxy', function(done) {
    proxy.connect({
      port: util.socketServerPort,
      host: 'proxy.koa-whistle.com',
      rules: { proxy: '127.0.0.1:' + util.proxyServerPort }
    }).then(function(socket) {
        socket.on('data', function(data) {
          assert('socket' === data + '');
          done();
        });
      });
  });
  it('#socks', function(done) {
    proxy.connect({
      port: util.socketServerPort,
      host: 'socks.koa-whistle.com',
      rules: { socks: '127.0.0.1:' + util.socksServerPort }
    }).then(function(socket) {
        socket.on('data', function(data) {
          assert('socket' === data + '');
          done();
        });
      });
  });
});

var assert = require('assert');
var proxy = require('../../lib');
var util = require('../util.test');
var request = require('request');
var r = request.defaults({ 'proxy': 'http://127.0.0.1:' + proxy.getPortSync() });

// describe('request', function() {
  it('#default', function(done) {
    r({ url: 'http://127.0.0.1:' + util.httpServerPort + '/test' },
    function(err, res, body) {
      assert(body === 'HTTP');
      done();
    });
  });
  it('#server', function(done) {
    r({ url: 'http://127.0.0.1:7001/test' },
    function(err, res, body) {
      assert(body === 'Hello world!');
      done();
    });
  });
//   it('#host', function(done) {

//   });
  it('#proxy', function(done) {
    var headers = {};
    proxy.setProxy(headers, '127.0.0.1:' + util.proxyServerPort);
    r({
      url: 'http://www.qq.com/abc',
      headers: headers,
    }, function(err, res, body) {
      assert(body === 'HTTP');
      done();
    });
  });
//   it('#socks', function(done) {

//   });
//   it('#https', function(done) {

//   });
//   it('#mock', function(done) {

//   });
// });

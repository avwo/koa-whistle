var proxy = require('../../lib');

// describe('request', function() {
//   it('#user', function(done) {

//   });
//   it('#server', function(done) {

//   });
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

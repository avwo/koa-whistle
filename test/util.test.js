var net = require('net');
var socks = require('socksv5');
var http = require('http');
var https = require('https');
var parseUrl = require('url').parse;
var path = require('path');
var fs = require('fs');

var proxyServerPort = exports.proxyServerPort = 1090;
var socksServerPort = exports.socksServerPort = 1080;
var httpServerPort = exports.httpServerPort = 1070;
var httpsServerPort = exports.httpsServerPort = 1060;
var options = {
  key: fs.readFileSync(path.join(__dirname, 'assets/certs/root.key')),
  cert: fs.readFileSync(path.join(__dirname, 'assets/certs/root.crt'))
};

exports.startProxyServer = function() {
  var server = http.createServer(function(req, res) {
    var fullUrl = /^http:/.test(req.url) ? req.url : 'http://' + req.headers.host + req.url;
    var options = parseUrl(fullUrl);
    delete options.hostname;
    options.host = '127.0.0.1';
    options.port = httpServerPort;
    options.method = req.method;
    options.headers = req.headers;
    var client = http.request(options, function(_res) {
      _res.pipe(res);
    });
    req.pipe(client);
  });

  server.on('connect', function(req, socket) {
    var client = net.connect({
      host: '127.0.0.1',
      port: httpsServerPort
    }, function() {
      socket.pipe(client).pipe(socket);
      socket.write('HTTP/1.1 200 Connection Established\r\nProxy-Agent: whistle/test\r\n\r\n');
    });
  });

  return new Promise(function(resolve) {
    server.listen(proxyServerPort, resolve);
  });
};

exports.startSocksServer = function() {
  var socksServer = socks.createServer(function(info, accept, deny) {
    var socket, client;
    if (info.dstPort === 443) {
      if (socket = accept(true)) {
        client = net.connect({
          host: '127.0.0.1',
          port: httpsServerPort
        }, function() {
          socket.pipe(client).pipe(socket);
        });
      }
      return;
    }
    if (info.dstPort === 80) {
      if (socket = accept(true)) {
        client = net.connect({
          host: '127.0.0.1',
          port: httpServerPort
        }, function() {
          socket.pipe(client).pipe(socket);
        });
      }
      return;
    }
    if (socket = accept(true)) {
      var body = 'socks';
      socket.end([
        'HTTP/1.1 200 OK',
        'Connection: close',
        'Content-Type: text/plain;charset=utf8',
        'Content-Length: ' + Buffer.byteLength(body),
        '',
        body
      ].join('\r\n'));
    }
  });
  socksServer.useAuth(socks.auth.None());
  return new Promise(function(resolve) {
    socksServer.listen(socksServerPort, resolve);
  });
};

exports.startHttpServer =function() {

  return Promise.all([
    new Promise(function(resolve) {
      https.createServer(options, function(req, res) {
        res.end('HTTPS');
      }).listen(httpsServerPort);
    }),
    new Promise(function(resolve) {
      var server = http.createServer(function(req, res) {
        res.end('HTTP');
      });
      server.listen(httpServerPort, resolve);
    }),
  ]);
};




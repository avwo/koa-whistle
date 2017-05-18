const net = require('net');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const parseUrl = require('url').parse;

const httpServerPort = exports.httpServerPort = 1070;
const httpsServerPort = exports.httpsServerPort = 1060;
const socketServerPort = exports.socketServerPort = 1050;
const certOpts = {
  key: fs.readFileSync(path.join(__dirname, 'assets/certs/root.key')),
  cert: fs.readFileSync(path.join(__dirname, 'assets/certs/root.crt')),
};

exports.PATHNAME = '/whistle/test';

exports.startHTTPServer = () => {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.end('HTTP');
    });
    server.listen(httpServerPort, resolve);
  });
};

exports.startHTTPsServer = () => {
  return new Promise((resolve) => {
    https.createServer(certOpts, (req, res) => {
      res.end('HTTPs');
    }).listen(httpsServerPort, resolve);
  });
};

exports.startSocketServer = function () {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.on('connection', (socket) => {
      setTimeout(() => {
        socket.write('socket');
      }, 100);
    });
    server.listen(socketServerPort, resolve);
  });
};

exports.formatOptions = ({ url, host, port }) => {
  const options = parseUrl(url);
  if (host) {
    options.hostname = host;
  }
  if (port > 0) {
    options.port = port;
  }
  return { uri: options };
};

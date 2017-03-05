var express = require('express');
var app =express();
var proxy = require('../express');
var join = require('path').join;
var baseDir = join(__dirname, '../');
var serverPort = 8001;

app.use(proxy({
  baseDir: baseDir,
  name: 'test',
  serverPort: serverPort,
  port: serverPort + 10000,
}));
app.use(function (req, res, next) {
  res.send('Hello world.');
});

app.listen(serverPort, function() {
  console.log('Server listening on %s.', serverPort);
});

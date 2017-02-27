var Koa = require('koa');
var app = new Koa();
var proxy = require('../koa');
var serverPort = 7001;

app.use(proxy({
  name: 'test',
  serverPort: serverPort,
  port: serverPort + 10000,
}));
app.use(function* (next) {
  this.body = 'Hello world!';
});

app.listen(serverPort);

var Koa = require('koa');
var app = new Koa();
var useProxy = require('../koa');
var serverPort = 7001;

app.use(useProxy({
  name: 'test',
  serverPort: serverPort,
  port: 7799,
}));
app.use(function* (next) {
  this.body = 'Hello world!';
});

app.listen(serverPort);

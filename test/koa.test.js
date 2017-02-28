var Koa = require('koa');
var app = new Koa();
var proxy = require('../koa');
var util = require('./util.test');
var serverPort = 7001;

app.use(proxy({
  name: 'test',
  serverPort: serverPort,
  port: serverPort + 10000,
}));
app.use(function* () {
  this.body = 'Hello world!';
});
/**
 * 如果是koa2，把上面两个use替换成下面的方式即可
 *
 var proxy = require('../koa2');
 app.use(proxy({
    name: 'test',
    serverPort: serverPort,
    port: serverPort + 10000,
  }));
  app.use(async (ctx) => {
    ctx.body = 'Hello world!';
  });

 *
 */

app.listen(serverPort, function() {
  console.log('Server listening on %s.', serverPort);
});

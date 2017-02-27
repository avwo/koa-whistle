var Koa = require('koa');
var app = new Koa();
var proxy = require('../koa2');
var serverPort = 8001;

app.use(proxy({
  name: 'test',
  serverPort: serverPort,
  port: serverPort + 10000,
}));
app.use(async (ctx) => {
  ctx.body = 'Hello world!';
});

app.listen(serverPort, function() {
  console.log('Server listening on %s.', serverPort);
});

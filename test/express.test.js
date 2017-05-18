const express = require('express');
const proxy = require('../lib');
const { PATHNAME } = require('./util.test');

module.exports = () => {
  const app = express();
  const serverPort = 8001;

  app.use(proxy.createExpressMiddleware({ serverPort, pathname: PATHNAME }));
  app.use((req, res) => {
    res.send('express');
  });
  return new Promise((resolve) => {
    app.listen(serverPort, () => {
      resolve(serverPort);
    });
  });
};

# koa-whistle
[![node version](https://img.shields.io/badge/node.js-%3E=_6-green.svg?style=flat-square)](http://nodejs.org/download/)
[![build status](https://img.shields.io/travis/avwo/koa-whistle.svg?style=flat-square)](https://travis-ci.org/avwo/koa-whistle)
[![Test coverage](https://codecov.io/gh/avwo/koa-whistle/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/avwo/koa-whistle)
[![David deps](https://img.shields.io/david/avwo/koa-whistle.svg?style=flat-square)](https://david-dm.org/avwo/koa-whistle)
[![License](https://img.shields.io/npm/l/koa-whistle.svg?style=flat-square)](https://www.npmjs.com/package/koa-whistle)

集成[whistle](https://github.com/avwo/whistle)的express、koa、koa2的中间件，通过该中间件可以在启动web服务时运行一个whistle，通过whistle查看所有访问web服务的请求，web服务内部程序调用的http[s]、socket请求也可以转发到该whistle，通过whistle请求指定的ip和端口；也可以直接转发到本地或远程的whistle，无需每个web服务起一个whistle(如果是远程whistle，最好把whistle升级到最新版本，方便查看https请求)；从而可以通过whistle及whistle的插件操作所有用户请求和程序内部发出的请求，如：mock数据、配置hosts、设置代理、替换请求等，更多功能参见[whistle帮助文档](https://avwo.github.io/whistle/)

# 安装

```  npm i --save koa-whistle```

*Note: koa-whistle要求 `Node >= v6.0.0`，如果要作为koa2的中间件要求 `Node >= v7.0.0`*



# 使用

```const proxy = require('koa-whistle');```



#### 使用内置whistle代理

启动内置whistle(可选，也可以直接把请求转发到指定外部的whistle或Fiddler、Charles等其它web代理，这个后面再讲)，如果是cluster模式，要在master进程上启动:

``` 
proxy.startWhistle({
  name: 'package.name', // 必填，一般为项目package.json的name字段
  port: 16001, // 必填，whistle监听的端口号，一般可以设置为服务器端口号 + 10000，后面讲如何访问该whistle操作界面，可以直接通过web服务器的端口来访问
  baseDir: path.join(__dirname, '../project'), // 可选，一般为项目的根目录路径，主要用于内置的whistle加载项目自带的whistle插件
  username: '', // 可选，设置whistle操作界面的用户名
  password: '', // 可选，设置whistle操作界面的密码
  rules: 'www.test.com 127.0.0.1\nwww.abc.com 1.1.1.1:8080', // 可选，设置whistle的默认规则Default
  values: { test: 123, abc: 321}, // 可选，设置whistle的Values
  sockets: 60, // 可选，设置同一个域名whistle的并发请求量，默认为60，一般无需配置
})
```

1. koa2

   ``` 
   const koa = require('koa');
   const app = new Koa();
   const serverPort = 6001;

   app.use(proxy.createMiddleware({
   	serverPort, // 必填，web服务器监听的端口
   	name: 'package.name', //可选，一般为项目package.json的name字段，默认为koa-whistle，用于设置请求头标识
   	pathname: '/whistle', // 可选，默认为/whistle, 访问whistle界面的路径，默认可以通过 http://127.0.0.1:6001/whistle访问whistle的界面
   	rules: [`www.test.com 127.0.0.1:6666`, `www.abc.com 127.0.0.1`], // 可选，字符串或数组，设置用户请求的whistle规则，具体参见后面API说明
   	values: { a: 1, b: 2 } // 可选，设置用户请求的whistle的Values，具体参见后面API说明
   }));
   app.use((ctx) => {
   	ctx.body = 'koa2';
   });
   app.listen(serverPort);
   ```

   ​

2. koa

   ```
   const koa = require('koa');
   const app = new Koa();
   const serverPort = 6001;

   app.use(proxy.createKoaMiddleware({
   	serverPort, // 必填，web服务器监听的端口
   	name: 'package.name', //可选，一般为项目package.json的name字段，默认为koa-whistle，用于设置请求头标识
   	pathname: '/whistle', // 可选，默认为/whistle, 访问whistle界面的路径，默认可以通过 http://127.0.0.1:6001/whistle访问whistle的界面
   	rules: [`www.test.com 127.0.0.1:6666`, `www.abc.com 127.0.0.1`], // 可选，字符串或数组，设置用户请求的whistle规则，具体参见后面API说明
   	values: { a: 1, b: 2 } // 可选，设置用户请求的whistle的Values，具体参见后面API说明
   }));
   app.use(() => {
   	this.body = 'koa';
   });
   app.listen(serverPort);
   ```

   ​

3. express

   ```
   const express = require('express');
   const app = express();
   const serverPort = 6001;

   app.use(proxy.createExpressMiddleware({
   	serverPort, // 必填，web服务器监听的端口
   	name: 'package.name', //可选，一般为项目package.json的name字段，默认为koa-whistle，用于设置请求头标识
   	pathname: '/whistle', // 可选，默认为/whistle, 访问whistle界面的路径，默认可以通过 http://127.0.0.1:6001/whistle访问whistle的界面
   	rules: [`www.test.com 127.0.0.1:6666`, `www.abc.com 127.0.0.1`], // 可选，字符串或数组，设置用户请求的whistle规则，具体参见后面API说明
   	values: { a: 1, b: 2 } // 可选，设置用户请求的whistle的Values，具体参见后面API说明
   }));
   app.use((req, res) => {
   	res.send('express');
   });
   app.listen(serverPort);
   ```

   配置好上述中间件后启动web服务，默认可以通过[http://127.0.0.1:6001/whistle](http://127.0.0.1:6001/whistle)(端口6001为web服务的端口，根据具体服务端口设置更改)访问whistle的操作界面

   ![whistle](https://raw.githubusercontent.com/avwo/whistleui/master/img/koa-whistle/whistle.png)

服务器内部请求转发到内置whistle:

1. http[s]请求: 

   - `proxy.request(options)`: 返回Promise对象，通过该对象可以获取请求的response对象

     ```
     const result = proxy.request('https://github.com');
     // 可以用yield或await转成类似同步的调用方式
     result.then((res) => {
       const { statusCode, headers } = res;
       res.on('data', (data) => {
         // handle data
       });
       res.on('end', () => {
         // end
       });
       // res.pipe(destStream);
     }).catch((err) => {
       // handle error
     });
     ```

     ​

   - `proxy.request(options, cb)`:  返回Promise对象，可以通过该对象获取对象{ statusCode, headers }和响应内容body，也可以直接在回调cb里面获取

     ```
     # 返回promise
     const result = proxy.request('https://github.com', true);
     result.then((res) => {
       const { statusCode, headers, body } = res;
       // do sth
     }).catch((err) => {
       // handle error
     });

     # 在cb里面获取数据
     proxy.request('https://github.com', (err, res, body) => {
       // do sth
     });
     ```

     ​

   关于 `options` 的参考：[request](https://github.com/request/request#requestoptions-callback)，除此之外，options还可以通过rules和values携带whistle的rules和values，其中rules可以为字符串或数组，values为json对象，`proxy.request` 会分别把这两个转成字符串放到 `x-whistle-rules` 和 `x-whistle-values` 两个请求头字段，这个需要跟插件[whistle.rules](https://github.com/whistle-plugins/whistle.rules)配合使用。

2. socket请求:

   ```
   proxy.connect({
     port: 3306, // 必填，socket server的端口号
     host: '10.10.10.10', // 可选，默认为 `127.0.0.1`，socket server的ip地址，可以用域名代替ip
     headers: {}, // 可选，自定义请求代码的头字段
     rules: [`www.test.com 127.0.0.1:6666`, `www.abc.com 127.0.0.1`], // 可选，字符串或数组，设置用户请求的whistle规则，同上
   	values: { a: 1, b: 2 } // 可选，设置用户请求的whistle的Values，同上
   });
   ```

#### 使用外部代理

直接把请求转发到外部的whistle或其它web代理(如: Fiddler、Charles)，这个时候无需执行 `proxy.startWhistle(options)`，以koa2为例，其它的同理:

```
const koa = require('koa');
const app = new Koa();
const serverPort = 6001;

app.use(proxy.createMiddleware({
	serverPort, // 必填，web服务器监听的端口，用于whistle把请求转回指定的服务器和端口
	serverIp: '127.0.0.1', // 可选，默认为127.0.0.1，用于whistle把请求转回指定的服务器和端口，可以通过proxy.getServerIp()获取当前部署机器的内网ip，如果whistle不是跟web服务部署在同一台机器，则需要指定web服务所在机器的ip
	proxyPort: 8899, // 必填，指定外部代理服务的端口
	proxyPort: '127.0.0.1', // 可选，指定外部代理服务的ip，默认为127.0.0.1
	name: 'package.name', //可选，一般为项目package.json的name字段，默认为koa-whistle，用于设置请求头标识
	pathname: '/whistle', // 可选，默认为/whistle, 访问whistle界面的路径，默认可以通过 http://127.0.0.1:6001/whistle访问whistle的界面
	rules: [`www.test.com 127.0.0.1:6666`, `www.abc.com 127.0.0.1`], // 可选，字符串或数组，设置用户请求的whistle规则，具体参见后面API说明
	values: { a: 1, b: 2 } // 可选，设置用户请求的whistle的Values，具体参见后面API说明
}));
app.use((ctx) => {
	ctx.body = 'koa2';
});
app.listen(serverPort);
```

配置好上述中间件后启动web服务，默认可以通过[http://127.0.0.1:6001/whistle](http://127.0.0.1:6001/whistle)(端口6001为web服务的端口，根据具体服务端口设置更改)访问whistle的操作界面。

服务器内部请求转发到外部代理服务器(如果是whistle，要安装插件[whistle.rules](https://github.com/whistle-plugins/whistle.rules)，其它代理需要手动配置把请求转会web服务): 

```
const outerProxy = proxy.getProxy({
	proxyPort: 8899, // 必填，指定外部代理服务的端口
	proxyPort: '127.0.0.1', // 可选，指定外部代理服务的ip，默认为127.0.0.1
});
outerProxy.request 和 outerProxy.connect 参见服务器内部请求转发到内置whistle的 proxy.request 和 proxy.connect
```



# API

```const proxy = require('koa-whistle');```

1. `proxy.startWhistle(options) || proxy.startProxy(options)`: 运行内置whistle，如果是 **cluster模式**，可以在master进程上运行whistle即可；不一定要启动内置的whistle，也可以直接使用外部现有的whistle，如果需要使用外面已经运行的whistle，必须安装一个插件：[whistle.rules](https://github.com/whistle-plugins/whistle.rules)

   `options`:

   - `name`:  **必填**，String，项目的名称，一般为项目package.json对应的name，用于区分whistle的存储目录

   - `port`: **必填**，1~65535的整数，whistle的启动端口

   - `baseDir`: 可选，String，一般为项目的根目录(即package.json所在目录)，主要用于自动加载`baseDir/node_modules`安装的whistle插件

   - `rules`: 可选，String，whistle的默认规则，如 :

     ``` 
     www.test.com 127.0.0.1:6666
     www.abc.com file:///User/xxx
     ```

     ​

   - `values`: 可选，json对象，设置whistle的Values

   - `username`: 可选，whistle操作界面的用户名

   - `password`: 可选，whistle操作界面的密码

   - `sockets`: 可选，每个域名的并发请求数，默认为60，一般使用默认配置即可

2. `proxy.createMiddleware(options)`: 创建koa2的中间件，其中

   options:

   - `serverPort`:  **必填**，web服务监听的端口
   - `serverHost`: 可选，默认为127.0.0.1，web服务所在机器的ip
   - `name`: 可选，项目的名称，一般为package.json里面的name字段
   - `proxyHost`: 可选，默认为127.0.0.1，代理服务器的ip
   - `proxyPort`: 代理服务器的端口，如果启动了内置whistle，会默认使用内置whistle的端口，否则需要指定代理服务器的端口
   - `rules`: 可选，数组或字符串，设置whistle的规则，如果是外置的whistle代理，需要安装插件[whistle.rules](https://github.com/whistle-plugins/whistle.rules)才能生效
   - `values`: 可选，JSON对象，设置whistle的values，如果是外置的whistle代理，需要安装插件[whistle.rules](https://github.com/whistle-plugins/whistle.rules)才能生效
   - `filter(req)`: 返回false(或返回Promise，Promise.resolve(false))，表示请求不要经过代理，req为koa和、express的this.req、ctx.req、req对象
   - `pathname`:  可选，默认为/whistle，设置访问whistle操作界面的路径，如果需要禁用，可以设置为`?`，如pathname设置为`/a/b/c`，则可以通过[http://127.0.0.1:6001/a/b/c](http://127.0.0.1:6001/a/b/c)(端口6001为web服务的端口，根据具体服务端口设置更改)访问whistle的操作界面

3. `proxy.createKoaMiddleware(options)`: 创建koa 1.x的中间件，options同 `proxy.createMiddleware(options)`

4. `proxy.createExpressMiddleware(options)`: 创建express的中间件，options同 `proxy.createMiddleware(options)`

5. `proxy.request(options[, cb])`: 发送http[s]请求，返回Promise(如果cb不为空或者为function，会直接返回响应的body，具体用法可以参考上面的例子)，这些请求可以在内置whistle界面上看到，其中options参考[request](https://github.com/request/request#requestoptions-callback)，除此之外，options还可以通过rules和values携带whistle的rules和values，其中rules可以为字符串或数组，values为json对象，`proxy.request` 会分别把这两个转成字符串放到 `x-whistle-rules` 和 `x-whistle-values` 两个请求头字段，这个需要跟插件[whistle.rules](https://github.com/whistle-plugins/whistle.rules)配合使用

6. `proxy.connect(options)`: 发送socket请求，这些请求可以在内置whistle界面上看到，具体用法可以参考上面的使用例子

7. `proxy.getProxy(options)`: 通过传人的 `proxyHost` 和 `proxyPort` 获取新的代理对象，该对象包含 { request, connect } 两个方法，这两个方法的用法同上，请求会转发到指定的代理服务，如果不填则使用默认内置代理(这种情况要确保已经执行`proxy.startWhistle`)

   options:

   - proxyHost: 代理的ip或域名，默认为127.0.0.1
   - proxyPort: 代理端口

8. `proxy.getServerIp()`: 获取当前服务器的内网ip

9. `proxy.getRandomPort()`: 随机获取未被使用的端口，该接口是异步的，返回一个Promise对象，可以通过该Promise对象获取未被使用的端口，具体用法看下面的例子。

10. `proxy.isRunning()`: true | false，判断当前内置whistle是否处于运行中，内置whistle可以同时起多个(不同的whistle实例要确保name属性不一样，否则规则会相互覆盖)。




# 例子

以koa2为例：

1. 确保本地安装的 `Node >= 7.6.0`

2. 安装全局koa、koa-whistle

   ```
   npm i -g koa koa-whistle
   ```

   ​

3. 完整代码:

   server.js:

   ```
   const proxy = require('koa-whistle');
   const Koa = require('koa');

   const app = new Koa();
   const port = 7001;
   proxy.getRandomPort().then((randomPort) => {
     // 如果要使用内置的whistle，一定要确保startWhistle在crreateMiddleware前执行
     proxy.startWhistle({ name: 'test-koa-whistle', port: randomPort });
     app.use(proxy.createMiddleware({ serverPort: port }));
     app.use(async (ctx) => {
       const res = await proxy.request('https://github.com');
       ctx.status = res.statusCode;
       ctx.set(res.headers);
       ctx.body = res;
     });
     app.listen(port, () => {
       console.log(`Server listening on ${port}.`);
     });
   });
   ```

   执行:

   ```
   node server
   ```

   打开 [http://127.0.0.1/whistle](http://127.0.0.1/whistle) 效果图:

   ![非cluster模式的例子](https://raw.githubusercontent.com/avwo/whistleui/master/img/koa-whistle/demo1.gif)

4. 如果是cluster模式启动的，要在master进程上执行 `startWhistle(options)`:

   dispatch.js:

   ```
   const cluster = require('cluster');
   const proxy = require('koa-whistle');
   const Koa = require('koa');

   if (cluster.isMaster) {
     proxy.getRandomPort().then((randomPort) => {
       // 如果要使用内置的whistle，一定要确保startWhistle后才fork worker
       proxy.startWhistle({ name: 'test-cluster', port: randomPort });
       cluster.fork();
     });
   } else {
     const app = new Koa();
     const port = 8001;

     app.use(proxy.createMiddleware({
       serverPort: port,
       pathname: '/test/cluster',
     }));
     app.use(async (ctx) => {
       const res = await proxy.request({
         uri: 'https://github.com',
         rules: 'github.com file://{test.html}',
         values: { 'test.html': 'Hi all!'},
       });
       ctx.status = res.statusCode;
       ctx.set(res.headers);
       ctx.body = res;
     });
     app.listen(port, () => {
       console.log(`Server listening on ${port}.`);
     });
   }
   ```

   执行:

   ```
   node dispatch
   ```

   打开 [http://127.0.0.1/test/cluster](http://127.0.0.1/test/cluster) 效果图:

   ![cluster模式的例子](https://raw.githubusercontent.com/avwo/whistleui/master/img/koa-whistle/demo2.gif)

更多用法参考：[测试用例](https://github.com/avwo/koa-whistle/blob/master/test/index.test.js)



#　Licence

[MIT](https://github.com/avwo/koa-whistle/blob/master/LICENSE)

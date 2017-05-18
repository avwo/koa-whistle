# koa-whistle

集成[whistle](https://github.com/avwo/whistle)的express、koa、koa2的中间件，通过该中间件可以在启动web服务时运行一个whistle，通过whistle查看所有访问web服务的请求，web服务内部程序调用的http[s]、socket请求也可以转发到该whistle，通过whistle请求指定的ip和端口；也可以直接转发到本地或远程的whistle，无需每个web服务起一个whistle；从而可以通过whistle及whistle的插件操作所有用户请求和程序内部发出的请求，如：mock数据、配置hosts、设置代理、替换请求等，更多功能参见[whistle帮助文档](https://avwo.github.io/whistle/)

# 安装

```  npm i --save koa-whistle```

*Note: koa-whistle要求 `Node >= v6.0.0`，如果要作为koa2的中间件要求 `Node >= v7.0.0`*



# 使用

```const proxy = require('koa-whistle');```



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

   - `values`: 可选，设置whistle的Values

   - `username`: 可选，whistle抓包配置界面的用户名

   - `password`: 可选，whistle抓包配置界面的密码

   - `sockets`: 可选，每个域名的并发请求数，默认为60

2. `proxy.createMiddleware(options)`: 创建koa2的中间件，其中

   options:

   - `proxyHost`: xxx
   - `proxyPort`: xxx
   - `serverPort`: xxx
   - `serverHost`: xxx
   - `name`: xxx
   - `rules`: xxx
   - `values`: xxx
   - `filter(req)`: xxx

3. `proxy.createKoaMiddleware(options)`: xxx

4. `proxy.createExpressMiddleware(options)`: xxx

5. `proxy.request(options[, cb])`: xxx

6. `proxy.connect(options)`: xxx

7. `proxy.getProxy({})`: xxx

8. `proxy.getServerIp()`: xxx

9. `proxy.getRandomPort()`: xxx

10. `proxy.isRunning()`: xxx




# koa-whistle

koa-whistle为集成[web调试代理工具whistle](https://github.com/avwo/whistle)的koa、koa@2及express的中间件，可以在web服务的开发调试阶段做如下的功能：

1. 查看所有请求服务器的http[s]请求
2. 查看所有服务器内部发出的http[s]、socket请求
3. 操作上述两种请求：mock数据、配置hosts、设置代理、替换请求等，更多功能参见：[whistle](https://github.com/avwo/whistle)


# 安装

	npm i --save-dev koa-whistle

# 使用

koa-whistle中间件支持koa@2、koa@1及express三种常用web框架，三种框架的处理引用的文件有区别以外，其它使用方法都一样：

	// 三种框架的初始化方式
	// koa@2(支持async-await的版本，版本大于 `v2.0.0` 的koa)
	const proxy = require('koa-whistle');
	const Koa = require('koa');
	const app = new Koa();

	// koa@1(支持generator的版本，版本小于 `v2.0.0` 的koa)
	/**
	var proxy = require('koa-whistle/koa');
	var Koa = require('koa');
	var app = new Koa();
	**/
	
	// express
	/**
	var proxy = require('koa-whistle/express');
	var express = require('express');
	var app = express();
	**/

	// 安装中间件
	var serverPort = 6001;
	var proxyPort = serverPort + 10000;
	app.use(proxy({
		name: 'test', // 项目名称，一般为package.json的name字段
		baseDir: 'xxxxxx', // 项目根目录，及package.json所在目录
		serverPort: serverPort, // 服务器监听的端口
		port: proxyPort, // whistle监听的端口
	}));

	// 设置其它中间件
	// koa@2(支持async-await的版本，版本大于 `v2.0.0` 的koa)
	app.use(async (ctx) => {
		ctx.body = 'Hello world!';
	});

	// koa@1(支持generator的版本，版本小于 `v2.0.0` 的koa)
	/**
	app.use(function* (next) {
		this.body = 'Hello world!';
	});
	**/
	
	// express
	/**
	app.use(function(req, res, next) {
		res.end('Hello world!');
	});
	**/

	app.listen(serverPort);


按上述方式启动后打开whistle的管理配置界面：[http://127.0.0.1:16001](http://127.0.0.1:16001/)，即可看到访问 `6001` 端口的所有请求。

![koa-whistle](https://raw.githubusercontent.com/avwo/whistleui/master/img/koa-whistle.png)

# API	

	// koa@2(支持async-await的版本，版本大于 `v2.0.0` 的koa)
	const proxy = require('koa-whistle');

	// koa@1(支持generator的版本，版本小于 `v2.0.0` 的koa)
	var proxy = require('koa-whistle/koa');

	// express
	var proxy = require('koa-whistle/express');

1. `proxy(options)`: 返回中间件方法，类型：`Function` 
	- `options`: 必填，包含以下属性
		- `baseDir`: 可选，项目的根路径，即 `package.json` 所在目录，主要用于whistle加载 `baseDir` 目录下安装的whistle插件。
		- `name`: 必填，当前项目package.json里面对应的name属性即可，用于区分其它服务器的标识及存储whistle配置
		- `serverPort`: 必填，当前服务器监听的端口号
		- `port`: 必填，whistle使用的端口号，一般可以设置为 `serverPort + 10000`
		- `rules`: 可选，设置whistle的默认规则，也可以通过whistle配置管理界面手动设置
		- `values`: 可选，往whistle的Values添加键值对
		- `sockets`: 可选，设置whistle对相同域名的并发数，默认60，使用默认配置即可
		- `username`: 可选，设置访问whistle管理界面的用户名，设置以后需要登录才能访问whistle的管理界面
		- `password`: 可选，设置访问whistle管理界面的密码，设置以后需要登录才能访问whistle的管理界面
		- `hint`: 可选，false | string, 用于关闭koa-whistle启动时控制台的提醒或重新修改whistle启动后控制台的提醒
		 
2. `proxy.ready()`: 返回一个Promise对象，whistle启动成功后会触发这个Promise对象，并把端口号传过来
3. `proxy.getPort()`: 同 `proxy.ready()
4. `proxy.getPortSync()`: 直接返回whistle监听的端口号，用这个方法不能确保whistle已经启动起来(一般除了启动初始化时调用接口用上面的 `getPort`，其它情况都可以直接设置接口)
5. `proxy.connect(options)`: 通过whistle代理建立一个socket连接，这样请求可以显示在whistle的请求列表中
	- `options`: 必填，包含一些属性
		- `host`: 设置请求的IP或host，同 [net.Socket](https://nodejs.org/dist/latest-v6.x/docs/api/net.html#net_socket_connect_options_connectlistener)
		- `port`: 请求端口号 
		- `rules`:  动态设置规则
			- `host`: 设置hosts，即请求服务器的ip和端口，如 `127.0.0.1`、`127.0.0.1:5566`
			- `proxy`: 设置代理服务器的ip和端口，如 `127.0.0.1:8899`
			- `socks`: 设置socksv5代理服务器的ip和端口，如 `127.0.0.1:1080`

5. `proxy.createConnection(options)`: 同 `proxy.connect(options)`
6. `proxy.setHost(headers, host)`:  设置http[s]请求的hosts，如 `127.0.0.1`、`127.0.0.1:5566`
7. `proxy.setProxy(headers, proxy)`: 设置http[s]请求的代理服务器的ip和端口，如 `127.0.0.1:8899`
8. `proxy.setSocks(headers, socks)`: 设置http[s]请求的socksv5代理服务器的ip和端口，如 `127.0.0.1:1080`
9. `proxy.setHttpsRequest(headers)`: 通过设置请求的headers，whistle可以自动把http请求转成https请求，具体参见测试用例的写法： [例子](https://github.com/avwo/koa-whistle/tree/master/test)



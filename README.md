# koa-whistle

koa-whistle为集成[web调试代理工具whistle](https://github.com/avwo/whistle)的koa、koa@2及express的中间件，利用[whistle](https://github.com/avwo/whistle)的抓包、[操作请求的能力](https://avwo.github.io/whistle/rules/)、及whistle的插件扩展能力，可以在web程序的开发调试阶段做如下的功能：

1. 通过内置的[whistle](https://github.com/avwo/whistle)界面查看所有访问服务器的请求，以及从服务器内部发出的请求(包括：http[s]和socket请求)；
2. 利用[whistle](https://github.com/avwo/whistle)操作这些请求，比如：重新设置hosts或者代理等把请求转发到其它服务器，修改头部、内容、注入监控脚本等等，特别是利用whistle配置hosts的功能可以服务器的内部请求直接使用域名访问，而无需开发阶段改成IP的方式；
3. 利用whistle的查看扩展能力，把插件集成到项目的开发依赖中，即可利用插件查看服务器内部通过socket的请求响应内容。


	【图片】

# 安装

	npm i --save-dev koa-whistle

# API
koa-whistle中间件支持koa@2、koa@1及express三种常用web框架，三种框架的处理引用的文件有区别以外，其它使用方法都一样：

	// koa@2
	const proxy = require('koa-whistle');
	
	// koa@1
	const proxy = require('koa-whistle/koa');

	// express
	const proxy = require('koa-whistle/express');


1. `proxy(options)`: 返回中间件方法，类型：`Function` 
	- `options`: 必填，包含以下属性
		- `name`: 必填，当前项目package.json里面对应的name属性即可，用于区分其它服务器的标识及存储whistle配置
		- `serverPort`: 必填，当前服务器监听的端口号
		- `port`: 必填，whistle使用的端口号，一般可以设置为 `serverPort + 10000`
		- `rules`: 可选，设置whistle的默认规则，也可以通过whistle配置管理界面手动设置
		- `values`: 可选，往whistle的Values添加键值对
		- `sockets`: 可选，设置whistle对相同域名的并发数，默认60，使用默认配置即可
		- `username`: 可选，设置访问whistle管理界面的用户名，设置以后需要登录才能访问whistle的管理界面
		- `password`: 可选，设置访问whistle管理界面的密码，设置以后需要登录才能访问whistle的管理界面
		 
2. `proxy.ready()`: 返回一个Promise对象，whistle启动成功后会触发这个Promise对象，并把端口号传过来
3. `proxy.getPort()`: 同 `proxy.ready()`
4. `proxy.createConnection(options)`: 通过whistle代理建立一个socket连接，这样请求可以显示在whistle的请求列表中
	- `options`: 必填，包含一些属性
		- ``: 
		- ``: 
		- ``: 

5. `proxy.createSocket(options)`: 同 `proxy.createConnection(options)`
6. `proxy.setHost(headers, host)`: 
7. `proxy.setProxy(headers, proxy)`: 
8. `proxy.setSocks(headers, socks)`: 

# 使用

1. koa@2(支持async-await的版本，版本大于 `v2.0.0` 的koa)

		const Koa = require('koa');
		const proxy = require('koa-whistle');
	
		const app = new Koa();
	
		// 最好放在所有中间件的前面
		// options见上面的API说明
		app.use(proxy(options));
		// 添加其它中间件

2. koa@1(支持generator的版本，版本小于 `v2.0.0` 的koa)

		var Koa = require('koa');
		// 注意路径和上面的区别
		var proxy = require('koa-whistle/koa');
	
		var app = new Koa();
	
		// 最好放在所有中间件的前面
		// options见上面的API说明
		app.use(proxy(options));
		// 添加其它中间件

3. express

		var express = require('express');
		// 注意路径和上面的区别
		var proxy = require('koa-whistle/express');
	
		var app = new Koa();
	
		// 最好放在所有中间件的前面
		// options见上面的API说明
		app.use(proxy(options));
		// 添加其它中间件
	
	
# 例子


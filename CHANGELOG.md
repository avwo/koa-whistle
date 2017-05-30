### v0.1.0
第一个正式版本

### v0.1.1
1. fix: 暴露 `getPortSync`

### v0.1.2
1. fix: 没有传递req.method

### v0.1.3
1. fix: 插件不要直接返回 `/./ protocol://xxx`，否则会影响该请求替换后的请求，即形如: `http://www.test.com http://www.example.com`

### v1.0.0
整个API重新设计，具体见[README](https://github.com/avwo/koa-whistle)

### v1.0.1
1. fix: 无法找到whistle.rules插件的问题

### v1.1.0
1. refactor: 升级whistle，支持查看所有https请求

### v1.1.1
1. refactor: 清除程序内部使用的请求头

### v1.1.2
1. feat: 添加 `proxyRequest` 保留原有request的方法
2. refactor: 不要全局hack request 

# v1.1.3
1. refactor: 防止用户请求自动处理redirect请求

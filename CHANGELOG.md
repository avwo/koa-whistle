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

# v1.0.1
1. fix: 无法找到whistle.rules插件的问题

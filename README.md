# koa-whistle
该模块已经不维护，建议采用以下方法替代：

![image](https://user-images.githubusercontent.com/11450939/101134297-1a7d6180-3645-11eb-88d9-baba1080c447.png)

将 [whistle](https://github.com/avwo/whistle) 服务独立部署（如果想部署到远程供多人共同使用，建议用 [nohost](https://github.com/nohosts/nohost)），请求先转到 whistle 或 nohost，再通过上面到规则转到指定的服务，如果该服务是 Node Server，可以通过 [lack-proxy](https://github.com/avwo/lack-proxy) 将服务内部发出的请求转到刚才的 whislte 或 nohost，再通过上面配置的规则转到指定到后台接口服务。

1. whistle: https://github.com/avwo/whistle
2. nohost: https://github.com/nohosts/nohost
3. lack-proxy: https://github.com/avwo/lack-proxy

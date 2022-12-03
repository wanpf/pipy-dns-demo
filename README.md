# dns demo
使用 pipy dns codec API + pjs 来实现dns解析、dns代理、dns缓存功能。  

# 目标
针对某些应用场景，需要对dns提供自定义解析、dns服务代理、dns解析结果缓存等，pipy 提供了 dns codec API。  
结合pipy js（简称pjs），就可以灵活、快速的实现以上功能。
# 演示用例
## 1、osm-edge dns demo  
功能：
osm-edge 在多集群场景，需要对外部集群的域名进行解析。  
该demo主要演示，根据 config.json 里面配置的信息来提供dns解析，对本地不能解析的域名转发到上游 dns 服务，实现dns代理功能。  
代码下载地址：  
https://github.com/wanpf/pipy-dns-demo/tree/main/osm-edge-dns  
包含的文件有：    
config.json  ： 配置文件，设置了域名 A记录信息  
config.js    ： 读取配置文件  
dns-main.js  ： dns 功能代码  
main.js      ： pjs 主文件  
使用以上文件启动 pipy 进程  
```bash
pipy main.js
```
执行如下命令，测试dns解析：  
```bash
dig @127.0.0.153 -p 5300 www.test.com a
dig @127.0.0.153 -p 5300 www.hello.com a
dig @127.0.0.153 -p 5300 www.flomesh.io a
```
## 2、dns-server demo  
功能： 
该demo实现了一个通用的dns服务器  
1、可以在数据文件里面设置各种类型（type）的 dns resource record  
2、实现了 dns 代理功能，将本地不能解析的请求转发到上游dns服务器来解析  
3、对dns查询结果进行缓存处理  
代码下载地址：  
https://github.com/wanpf/pipy-dns-demo/tree/main/dns-server  
包含的文件有：    
dns.json  ： 数据文件，可以设置各种类型的dns记录。  
dns.js    ： dns 功能模块  
cache.js  ： dns 缓存功能模块  
main.js      ： pjs 主文件  
使用以上文件启动 pipy 进程  
```bash
pipy main.js
```
执行如下命令，测试dns解析：  
```bash
dig @127.0.0.1 -p 5300 a11b22c33d44.com a
dig @127.0.0.1 -p 5300 a11b22c33d44.com aaaa
dig @127.0.0.1 -p 5300 a11b22c33d44.com mx
dig @127.0.0.1 -p 5300 _xmpp-client._tcp.a11b22c33d44.com srv
dig @127.0.0.1 -p 5300 a11b22c33d44.com txt
dig @127.0.0.1 -p 5300 10.139.168.192.in-addr.arpa ptr
dig @127.0.0.1 -p 5300 flomesh.cn a
```  



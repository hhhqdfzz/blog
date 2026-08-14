---
title: WWW服务器搭建
---

# {{ $frontmatter.title }}

## 开启 httpd 服务
```bash
systemctl start httpd   # 启动 HTTP 服务
systemctl enable httpd  # 设置 HTTP 服务开机自启
```
## 配置
```bash
vim /etc/httpd/conf/httpd.conf
```
## 写网站
```html
<!DOCTYPE html>
<html>
<head>
<title>服务器搭建入门</title>
</head>
<body>
<h1>服务器搭建入门</h1>
by 韩会会-QDFZZ.🔰
<p>恭喜你!成功搭建了一个最简单的服务器!</p>
<p>这份文件应该是 `/var/www/html/index.html`.</p>
</body>
</html>
```

## 申请域名

## 在客户端访问
在任意设备的任意浏览器中访问服务器的公网IP或域名，即可看到网站。默认显示服务器中的 `/var/www/html/index.html` 文件。

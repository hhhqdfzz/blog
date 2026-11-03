---
title: NVIDIA Driver
alias: [nvidia-driver]
os: [Windows, Linux]
category: [Development]
tags: [Graphics Driver, Driver, GPU] 
description: NVIDIA 显卡驱动。
---

# {{ $frontmatter.title }}

**Description：** {{ $frontmatter.description }}。

| 适用系统 | 类型 | 标签 |
| --- | --- | --- |
| {{ $frontmatter.os.join(', ') }} | {{ $frontmatter.category.join(', ') }} | {{ $frontmatter.tags.join(', ') }}

---

如果你的显卡是NVIDIA的，那么安装 NVIDIA Driver 能解决不能调整屏幕亮度、不能连接无线网络、无声音等影响系统基本使用的问题。

1. 卸载残留的NVIDIA驱动（防止冲突）。如果你之前从来没有安装过NVIDIA驱动，请跳过这一步。
	```bash
	sudo apt-get purge '^nvidia-.*'
	sudo apt-get autoremove
	```
2. 选定合适的NVIDIA驱动版本
	安装的版本要据你的显卡型号来定，到[官网](https://www.nvidia.com/en-us/drivers/)去查吧，结果可能有好几种版本，任选其一即可。
    > 由于NVIDIA官方的更新，在显卡型号不变的情况下，并不是永远适合安装某一个版本，所以不要凭上次查询的结果来确定版本。

	获取显卡型号：

	```bash
	binzz@C7VF:~$ lspci | grep -i nvidia
	01:00.0 VGA compatible controller: NVIDIA Corporation AD107M [GeForce RTX 4060 Max-Q / Mobile] (rev a1)
	01:00.1 Audio device: NVIDIA Corporation Device 22be (rev a1)
	binzz@C7VF:~$ 
	```
	可知，我的显卡型号是`GeForce RTX 4060`，在官网上查到支持的驱动版本是580，所以我应该安装580版本的驱动，即 `sudo apt install nvidia-driver-580`。

    > **注**：关于版本的选定，大多数说法分为如下两种：
    > 1. 安装 `ubuntu-drivers devices` 输出中推荐的驱动版本，比如推荐590，就是`sudo apt install nvidia-driver-590`
    > 2. 直接`sudo ubuntu-drivers autoinstall`，即可自动安装推荐的驱动版本，不需要看推荐。
    >
	> 这两种方法等效，我都试过，安装了之后重启，不仅没有解决驱动问题，连无线网络都不能用了。所以**不要听它的推荐！！！**

3. 重启系统
	```bash
	sudo reboot
	```
4. 重启后验证驱动是否激活
	```bash
	nvidia-smi
	```
	如果看到显卡信息就说明装成功了。

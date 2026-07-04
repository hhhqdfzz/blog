---
title: NVIDIA CUDA Toolkit
alias: [nvidia-cuda, cuda]
os: [Windows, Linux]
category: [Development]
tags: [Graphics Driver, CUDA, Parallel Computing, GPU] 
description: 用 GPU 
---

# {{ $frontmatter.title }}

**Description：** {{ $frontmatter.description }}。

| 适用系统 | 类型 | 标签 |
| --- | --- | --- |
| {{ $frontmatter.os.join(', ') }} | {{ $frontmatter.category.join(', ') }} | {{ $frontmatter.tags.join(', ') }}

---

1. 卸载残留的NVIDIA驱动（防止冲突）。如果你之前从来没有安装过NVIDIA驱动，请跳过这一步，以免误删。
	```bash
	sudo apt-get purge '^nvidia-.*'
	sudo apt-get autoremove
	```
2. 安装推荐的NVIDIA驱动
网上很多说法是安装 `ubuntu-drivers devices` 输出中推荐的驱动版本，比如推荐590，就是`sudo apt install nvidia-driver-590`，或者直接`sudo ubuntu-drivers autoinstall`，即可自动安装推荐的驱动版本，不需要看推荐。两者等效。
	这两种方法都我试过，安装了之后重启，不仅没有解决驱动问题，连无线网络都不能用了。所以**不要听它的推荐！！！**
	具体要安装哪个驱动版本，要根据你的显卡型号来定，到[官网](https://www.nvidia.com/en-us/drivers/)去查吧！
	获取显卡型号：

	```bash
	binzz@C7VF:~$ lspci | grep -i nvidia
	01:00.0 VGA compatible controller: NVIDIA Corporation AD107M [GeForce RTX 4060 Max-Q / Mobile] (rev a1)
	01:00.1 Audio device: NVIDIA Corporation Device 22be (rev a1)
	binzz@C7VF:~$ 
	```
	可知，我的显卡型号是`eForce RTX 4060`，在官网上查到支持的驱动版本是580，所以我应该安装580版本的驱动，即 `sudo apt install nvidia-driver-580`。
3. 重启系统
	```bash
	sudo reboot
	```
4. 重启后验证驱动是否激活
	```bash
	nvidia-smi
	```
	如果看到显卡信息就说明装成功了。

5. 再运行Gazebo，渲染窗口应该能打开。


[下载页](https://developer.nvidia.com/cuda-toolkit-archive)
[安装参考](https://blog.csdn.net/Sihang_Xie/article/details/127347139)




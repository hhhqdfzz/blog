---
title: Paragon Extfs for Windows
alias: [paragon_extfs_for_windows, paragon]
os: [Windows]
category: [System]
tags: [文件系统挂载, File System Mounting, extfs]
description: 帮助 Windows 系统读取 extfs 文件系统
---

# {{ $frontmatter.title }}

[下载页](https://www.virtualbox.org/wiki/Downloads)
[安装参考](https://blog.csdn.net/qq_32767041/article/details/84069088)

**Description：** {{ $frontmatter.description }}。

| 适用系统 | 类型 | 标签 |
| --- | --- | --- |
| {{ $frontmatter.os.join(', ') }} | {{ $frontmatter.category.join(', ') }} | {{ $frontmatter.tags.join(', ') }}

---

支持 ext2、ext3、ext4 等主流 Linux 文件系统，无需重启或虚拟机即可直接访问 Linux 分区中的文件。

打开软件，若想看 extfs 分区中存储的数据，请点击右上角的文件夹图标，如下图所示。
![Paragon Extfs for Windows 界面](assets/paragon-1.png)

这个软件有一个坏处是，会抢占对磁盘访问的控制权，导致其他软件（如启动盘制作工具Ventoy，Virtualbox 的 create medium 命令）读取不到任何磁盘。

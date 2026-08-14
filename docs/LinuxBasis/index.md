---
title: Linux 基础
next:
    text: 01 安装 Ubuntu 24.04.2 LTS（实机双系统）
    link: /LinuxBasis/01-安装Ubuntu
---


# {{ $frontmatter.title }}

::: info
这一系列叫做笔记而非教程，因为这是我个人的学习笔记，很多是在通用教程的基础上进行的补充。比如 PATH 环境变量、`cd`、`ls` 这些东西，大家都介绍得很完备了，就不需要我重复了。
:::

## 论“Linux系统”
“Linux系统”并不是说这个系统叫做Lilnux，而是说这个系统是基于Linux这个内核的。也就是说，**Linux只是一个用来开发操作系统的内核，并不是一个系统。** 所以我很不喜欢“Linux系统”这个说法。那应该怎么说呢？叫做**Linux发行版**，指的就是基于Linux开发的操作系统，比如Ubuntu、CentOS、Debian等，大致分为`Debian系`和`RedHat系`。
- Debian系：Ubuntu、Debian、Deepin、Linux Mint 等。
- RedHat系：CentOS、Fedora、RHEL、Rocky Linux 等。

Debian系更受个人用户欢迎，而RedHat系更受企业用户欢迎。两者管理软件包的命令也有区别，Debian系使用 `apt`和 `dpkg`，分别对应RedHat系的 `yum`（旧版，建议用 `dnf`） 和 `rpm`。

在后文，我将以Linux发行版”代替“Linux系统”的说法。

## 版本/型号问题
本笔记采用的各种版本/型号：
| 类型 | 版本/型号 | 在后文的简称 |
| :---: | :---: | :---: |
| 电脑 | 微星 Alpha 17 C7VF  | 设备 |
| Linux发行版 | Ubuntu 24.04.2 LTS，或其平替版本 Linux Mint 22.3。还会提到 RedHat 系的 Rocky Linux 10.1，是 CentOS 的延伸。 | Ubuntu/Mint/Rocky |


下面的结果可以看出，Linux Mint 可看作是 Ubuntu 的改编版本，只是在国内的知名度远远不如 Ubuntu 罢了。
```bash
binzz@C7VF:~$ sudo chroot /mnt/ubuntu/
root@C7VF:/# lsb_release -a
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 24.04.2 LTS
Release:	24.04
Codename:	noble
root@C7VF:/# uname -a
Linux C7VF 6.14.0-37-generic #37~24.04.1-Ubuntu SMP PREEMPT_DYNAMIC Thu Nov 20 10:25:38 UTC 2 x86_64 x86_64 x86_64 GNU/Linux
root@C7VF:/# 
exit
binzz@C7VF:~$ lsb_release -a
No LSB modules are available.
Distributor ID:	Linuxmint
Description:	Linux Mint 22.3
Release:	22.3
Codename:	zena
binzz@C7VF:~$ uname -a
Linux C7VF 6.14.0-37-generic #37~24.04.1-Ubuntu SMP PREEMPT_DYNAMIC Thu Nov 20 10:25:38 UTC 2 x86_64 x86_64 x86_64 GNU/Linux
binzz@C7VF:~$ 
```
至于自己版本、型号的情况，参考[“查看系统信息”一节](05-系统维护.md#查看系统信息)。




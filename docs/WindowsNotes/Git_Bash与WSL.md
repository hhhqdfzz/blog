---
title: Git Bash 与 WSL
---

# {{ $frontmatter.title }}

## 一句话总览
- **Git‑Bash**：Windows 版 Git 附带的**模拟层**，把部分 Linux shell 跑在 Windows 上，是 Git 的附属工具；
- **WSL(Windows Subsystem for Linux)**：Windows 的官方子系统，**完整运行真实 Linux 内核+发行版（Ubuntu等）**，是一套完整Linux环境。

## 底层实现原理
### Git‑Bash
> 基于 **MinGW / MSYS2**（Cygwin 衍生）
- 不是虚拟机，也不是子系统；是一套POSIX兼容翻译层，把Linux系统调用翻译成Win32 API。
- **没有Linux内核**，只是模拟bash、ls、cat等命令；底层依然是Windows。
- 随 Git for Windows 一起安装，**目的主要就是用来跑Git**。

### WSL（WSL2）
- WSL1：翻译层；WSL2：轻量虚拟机，有**真正的Linux内核**。
- 可以安装完整 Ubuntu / Debian 等发行版，拥有完整Linux系统调用、glibc。
- Windows官方功能，需要在Windows开启WSL组件后再装发行版。

> WSL2 ≈ 轻量化的虚拟机，但和Windows文件系统可以互通，性能比VMware好很多。

## 能力对比表
|项目|Git‑Bash|WSL2(推荐)|
|---|---|---|
|Linux内核|❌ 无内核，模拟|✅ 真实Linux内核|
|包管理器|几乎没有，不能apt/yum|✅ apt、可安装全套Linux软件|
|GCC、Python、Node|部分可以，但mingw编译产物是Windows exe|✅ 原生Linux二进制程序|
|Shell|只有bash（附带少量基础命令）|bash/zsh/fish全都可以装|
|文件访问|直接访问Windows盘符 `/c/`|Windows挂载到 `/mnt/c/`；WSL内部有独立Linux文件系统|
|GUI程序|基本不支持Linux GUI|WSLg可以直接跑Linux GUI软件|
|主要用途|Windows下使用git，简单shell脚本|后端开发、Linux开发环境、编译原生Linux程序|
|安装来源|安装Git for Windows自带|Windows功能，微软商店装Ubuntu|

## 文件系统坑点（非常重要）
### Git‑Bash
路径写法：`/c/Users/xxx`，底层就是Windows的NTFS磁盘；所有读写直接操作Windows文件。

### WSL2
- **Linux内部文件：`~/xxx`（放在WSL虚拟磁盘）速度很快**
- Windows挂载 `/mnt/c/` 访问Windows磁盘；**跨系统读写这里性能很差，尽量避免！**
> ❗开发代码尽量放在WSL家目录 `~`，不要放在 `/mnt/c`。

## 4.什么时候选哪个？
### ✅ 选 Git‑Bash
1. 你**主要就用git命令**，不想额外装WSL；
2. 偶尔跑几条简单linux风格shell命令；
3. 不想占用额外磁盘空间，轻量够用。

⚠️缺点：遇到复杂编译、Linux专属工具就会报错，glibc版本问题、部分shell脚本跑不起来。

### ✅ 选 WSL2
1. 做后端开发，需要完整Linux环境；
2. 需要apt安装各种工具、gcc、docker（WSL2支持docker‑desktop后端）；
3. 跑Linux脚本、测试部署逻辑；
4. 学习Linux。

> Git当然WSL里面也可以装 `apt install git`，git功能完全可用。

## 补充容易混淆点
1. **Git‑Bash ≠ WSL；Git‑Bash不是一个Linux**，只是Windows上模拟的shell；
2. WSL里面**不需要Git‑Bash**；WSL自带原生git；
3. PowerShell / CMD 是原生Windows shell，和这两个又是另外一套。

### 简单建议
> 如果只是日常git提交：Git‑Bash够用；
> 如果做后端、学Linux、编译项目，**直接上WSL2**。

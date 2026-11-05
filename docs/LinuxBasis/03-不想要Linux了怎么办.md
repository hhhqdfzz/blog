---
title: 03 不想要 Linux 了怎么办
---

# {{ $frontmatter.title }}

1. 备份数据
4. 重启计算机，进入 Live CD
2. 用 GParted 工具删除当初安装 Linux 的分区
3. 将多余的空间合并到其他分区
5. 如果只是删除某个 Linux Distribution，而还有其他 Linux Distribution，请参考[修复引导项](05-系统维护.md#修复引导项)，否则看本页下文。
6. 解决 [Windows 盘挂载错误](报错记录.md#Windows盘挂载错误)的问题


本文讨论的是第5步中，一个 Linux Distribution 都不想留的情况。
1. 删除 Linux 分区
2. 删除 ESP 中 `/EFI/` 下与 Linux Distribution 相关的目录

---
title: C++运行库（Microsoft Visual C++ Runtime Library）
---

# {{ $frontmatter.title }}

Windows 里常见的 `.dll`（如 `MSVCP140.dll`、`VCRUNTIME140.dll`、`VCRUNTIME140_1.dll`）不要从第三方 DLL 网站下载，应该安装微软官方的 **Visual C++ Redistributable**。

官方下载页面：

[https://learn.microsoft.com/zh-cn/cpp/windows/latest-supported-vc-redist](https://learn.microsoft.com/zh-cn/cpp/windows/latest-supported-vc-redist)

在页面中找到 **“Visual Studio 2015、2017、2019、2022”**，下载：

- 64 位 Windows：`x64`
- 32 位程序：`x86`
- ARM 设备：`ARM64`

你的普通台式机/笔记本通常建议两个都装：

1. `vc_redist.x64.exe`
2. `vc_redist.x86.exe`

安装后重启电脑。

另外，`.NET Framework` 相关 DLL 或运行问题用这个官方工具：

[https://dotnet.microsoft.com/zh-cn/download/dotnet-framework](https://dotnet.microsoft.com/zh-cn/download/dotnet-framework)

如果是 DirectX 游戏相关 DLL，例如 `d3dx9_*.dll`、`xinput*.dll`，可用微软 DirectX End-User Runtime：

[https://www.microsoft.com/zh-cn/download/details.aspx?id=35](https://www.microsoft.com/zh-cn/download/details.aspx?id=35)

重点：**不要去 DLL 下载站单独复制 DLL**，优先安装微软官方运行库。


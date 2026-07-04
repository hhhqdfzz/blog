---
title: 12 deb 包管理
---

# {{ $frontmatter.title }} 

更能处理 dpkg 无法处理的依赖问题，是 dpkg 的高级版本。

## 安装与卸载
```bash
# 安装软件包
sudo apt install <regex1> <regex2> ... <regexN>
# 安装特定版本的软件包
sudo apt install <package-name>=<version>
# 修复系统的软件安装错误
sudo apt -f install
# 修复依赖关系
sudo apt --fix-broken install
```
```bash
# 常规卸载
sudo apt remove <regex1> <regex2>... <regexN>   
# 卸载软件包并删除配置文件。相当于 remove 加上 --purge 选项
sudo apt purge <regex1> <regex2>... <regexN>
# 识别并卸载所有不再需要的软件包
sudo apt autoremove
# 清理旧的软件包缓存。
sudo apt clean
```

## 查看与搜索
### list
```bash
apt list                 # 列出所有软件包。
apt list --installed     # 列出已安装的软件包。
apt list --upgradable    # 列出可升级的软件包。
apt list --available     # 列出可用的软件包。
apt list --all-versions  # 列出所有版本的软件包。
apt list <regex>         # 按正则表达式列出软件包。
apt list <regex> -a      # 按正则表达式列出所有版本的软件包。
```
### search
```bash
# 基于`sudo apt update`的结果，按正则表达式搜索软件包。
# 安装的和未安装的都可以搜到，并注明是否安装了。
apt search <regex> 
```
### policy
`apt policy`按正则表达式查看某个包“有哪些版本”、“来自哪个源”、“版本和源的优先级如何”。
```bash
apt policy <regex>
```
```bash
# 案例1：由于snapd所有版本的优先级都小于0,所以禁止安装snapd
binzz@C7VF:~$ apt policy snapd                                  
snapd:
  已安装：(无)  # 当前系统已安装的版本
  候选： (无)   # 如果现在安装，会安装这个版本
  版本列表：
     2.67.1+24.04 -10 # <版本> <优先级>
        500 http://cn.archive.ubuntu.com/ubuntu noble-updates/main amd64 Packages # <优先级> <源>
     2.63+24.04ubuntu0.1 -10
        500 http://security.ubuntu.com/ubuntu noble-security/main amd64 Packages
     2.62+24.04build1 -10
        500 http://cn.archive.ubuntu.com/ubuntu noble/main amd64 Packages
     2.44.3+20.04 -10
        100 http://archive.ubuntu.com/ubuntu focal/main amd64 Packages

# 案例2：安装优先级最高的 inkscape 1.2.2-2ubuntu12。***代表已安装。  
binzz@C7VF:~$ apt policy inkscape
inkscape:
  已安装：1.2.2-2ubuntu12 
  候选： 1.2.2-2ubuntu12  
  版本列表：
 *** 1.2.2-2ubuntu12 500
        500 http://cn.archive.ubuntu.com/ubuntu noble/universe amd64 Packages
        100 /var/lib/dpkg/status  # 问题1：这是个软件源吗？不是的话为什么会出现在这里，还有优先级？
     0.92.5-1ubuntu1 100
        100 http://archive.ubuntu.com/ubuntu focal/universe amd64 Packages

# 案例3：问题2：为什么安装的不是优先级最高的？
binzz@C7VF:~$ apt policy ros-noetic-desktop-full
ros-noetic-desktop-full:
  已安装：1.5.0-1focal.20250521.014741  
  候选： 1.5.0-1focal.20250521.014741
  版本列表：
 *** 1.5.0-1focal.20250521.014741 100
        100 http://packages.ros.org/ros/ubuntu focal/main amd64 Packages
        100 /var/lib/dpkg/status
     1.5.0-0jammy 500
        500 https://ppa.launchpadcontent.net/ros-for-jammy/noble/ubuntu noble/main amd64 Packages
binzz@C7VF:~$                  
```
- **问题1**：不是。
  - 🔍 为什么会出现在 `apt policy` 里？
    APT 的版本选择机制是要比较这些来源：
    * 软件源里的所有版本（http URL）
    * 本地已经安装的版本（也就是 `/var/lib/dpkg/status` 中的版本）

    所以当运行 `apt policy ros-noetic-desktop-full` 时：
    ```text
     *** 1.5.0-1focal.20250521.014741 100
            100 http://packages.ros.org/ros/ubuntu focal/main amd64 Packages
            100 /var/lib/dpkg/status
    ```
    表示当前已经安装的这个版本，来自哪个源不重要，APT 会把它当作“候选之一”，其来源就是 `/var/lib/dpkg/status`。这也是 APT 判断“是否需要升级”的基础。
  - 💡 为什么它的优先级是 100？

    因为 APT 对本地已安装的包统一赋值`Pin-Priority = 100`。这意味着：

      * 如果软件源中有更高优先级（>100）且版本更新的包，APT 会升级。
      * 如果软件源中版本更高但优先级 < 100，APT 会保留本地这个包不升级。

    这就保证了系统的稳定性，不会随便被测试源、低优先级包给升级掉。

- **问题2**：好问题！因为APT安装软件的机制是，先看以前有没有安装过这个软件的某个版本，有则按以前的安装，否则将
可以找到的软件源依次按版本优先级、版本号、软件源优先级、被`sudo apt update`读取的顺序排序（前三者从高到低，最后一个从先到后），排除优先级小于100或不满足依赖的，选择排在NO.1的软件源进行安装。据此，案例3是因为在添加高优先级的源之前安装了低优先级的软件包。

### show
按正则表达式查看软件包的详细信息。安装的和未安装的都查看。
```bash
sudo apt show <regex> 
```

## 更新与升级
### update
读取`.sources`和`.list`文件中的软件源，联网刷新索引。
```bash
sudo apt update
```
运作流程：
1. 读取`/etc/apt/`和`/etc/apt/sources.list.d`目录下的所有`.sources`和`.list`文件。`.sources`比`.list`优先被读取，同一扩展名的文件按文件名称的顺序读取。
2. 按照读取到的源条目进行软件源更新。    
    
    实际上，`apt update` 的获取（Get）和命中（Hit）的数量、编号、顺序等，受到缓存、网络、合并请求、镜像重定向（命中的URL与配置的URI不一致，比如配置的是Ubuntu官方源，命中的却是清华源）等多重因素的影响，导致：
    - 命中数$\neq$软件源数
    - 命中顺序$\neq$软件源被读取到的顺序
    - 命中&获取编号，是并行请求的结果，只是临时任务 ID，不代表顺序。如果某些源响应慢，可能先显示后面的命中。
3. 存储更新结果，以便APT的查找、安装类命令使用。
### upgrade
升级所有已安装的软件包。
```bash
sudo apt upgrade
```

## 源管理
```bash
# 添加软件源
sudo add-apt-repository <repository_name>
# 删除软件源
sudo add-apt-repository --remove <repository_name>
# 列出所有已添加的软件源
sudo add-apt-repository --list
```

## APT的图形化界面synaptic（新立得）{#synaptic}
打开一个新的终端，显示如下：
```bash
  │
  │ synaptic
  │
  │ APT 的图形化界面(新立得)，需要 synaptic。
  │

                                                             -- Debian 参考卡片
binzz@C7VF:~$ synaptic
找不到命令 “synaptic”，但可以通过以下软件包安装它：
sudo apt install synaptic
binzz@C7VF:~$
```
安装`synaptic`后，启动它，界面如下图所示：
![synaptic界面](assets/softmanage-2.png)
如果不以`sudo`启动，会弹出如下窗口：
![不以sudo启动synaptic的结果](assets/softmanage-3.png)
但是点击“关闭“就好了，可以进入正常的界面，只是不能执行相关操作。

至于为什么打开终端后会有“Debian 参考卡片”，参见[“fortune名人名言”](14-娱乐篇.md#fortune)和[“启动机制”](07-Bash与终端.md#启动机制)两节。



## 有关APT的文件解析
想弄清楚APT深层的机制，需要研究APT的相关文件。
```bash
binzz@C7VF:~$ ll /etc/apt | awk '{printf $1 "\t" $9 "\n"}'
总计	
drwxr-xr-x	./
drwxr-xr-x	../
drwxr-xr-x	apt.conf.d/
drwxr-xr-x	auth.conf.d/
drwxr-xr-x	keyrings/
drwxr-xr-x	preferences.d/
drwxr-xr-x	preferences.d.save/
-rw-r--r--	sources.list
drwxr-xr-x	sources.list.d/
-rw-r--r--	sources.list.save
-rw-r--r--	trusted.gpg
-rw-r--r--	trusted.gpg~
drwxr-xr-x	trusted.gpg.d/
binzz@C7VF:~$ 
```
还有一个与APT运作有关的目录是`/usr/share/keyrings/`，存放的都是`.gpg`密钥文件。故以上文件或目录分为**配置&备份**、**软件源**、**密钥**、**优先级**四类。
### 配置&备份类
- **`/etc/apt/apt.conf.d/`**：APT 配置文件目录。
- **`/etc/apt/auth.conf.d/`**：认证配置文件目录。
- **`*.save`** 和 **`/etc/apt/trusted.gpg~`**：备份。

一般不会做改动。

### 软件源类
重点，是经常改动的部分。
#### .list文件
##### 主要位置
- **`/etc/apt/sources.list`**：主软件源配置文件，不建议使用。
    ```bash
    # Ubuntu sources have moved to /etc/apt/sources.list.d/ubuntu.sources
    ```
- **`/etc/apt/sources.list.d/`目录中。推荐。
##### 内容解析
以`ros-latest.list`为例：
```
deb [signed-by=/usr/share/keyrings/ros-noetic-keyring.gpg] http://packages.ros.org/ros/ubuntu focal main
```
拆开来看：
```
deb                      ➜ 这是一个二进制包源（vs 源码包 source deb-src）
[signed-by=...]          ➜ 使用哪个 GPG 公钥（本文称为密钥）验证这个源
http://packages.ros.org  ➜ 源服务器地址
/ros/ubuntu              ➜ 路径
focal                    ➜ Linux发行版代号（指定哪个版本的软件）
main                     ➜ 仓库组件，类似分类（还有 universe、multiverse、restricted 等）
```
👉 我用的是 Ubuntu 24.04（noble），但源是 focal 的，这就是“混源”。

👉 如果没有指定`signed-by`，APT以如下顺序查找密钥：
1. **首先检查 `/usr/share/keyrings/`**  
   如果软件源 URL 匹配已知的官方源（如 `archive.ubuntu.com`），APT 会尝试用 `/usr/share/keyrings/ubuntu-archive-keyring.gpg` 验证。

2. **回退到全局密钥环**  
   如果找不到专用密钥，APT 会扫描全局密钥环：
   - `/etc/apt/trusted.gpg`
   - `/etc/apt/trusted.gpg.d/*`
   直到找到能验证该软件包的密钥。

3. **最终失败**  
   如果所有密钥均验证失败，则报错。

#### .sources文件
里面的每个源大概表示成：
```bash
Types: deb
URIs: https://ppa.launchpadcontent.net/ros-for-jammy/noble/ubuntu/
Suites: noble
Components: main
Signed-By: -----BEGIN PGP PUBLIC KEY BLOCK----- # 内联 GPG 公钥块
        ... 省略多行
 -----END PGP PUBLIC KEY BLOCK-----
```
- **Types**
  指定软件包的类型，决定从哪个「软件分组」获取包（如 deb、deb-src）。
- **URIs**
  - 支持多个镜像：  
    ```ini
    URIs: http://mirror1 http://mirror2
    ```
    这不是多个源，而是单源多镜像，APT 会自动选择最快的镜像，而不选择其他的镜像。
  - 📌 URI 和 URL 的区别（很小但有）
    | 对象      | 含义                                | 举例                                |
    | ------- | --------------------------------- | --------------------------------- |
    | **URL** | Uniform Resource Locator，资源定位符    | `http://example.com/foo/bar.html` |
    | **URI** | Uniform Resource Identifier，资源标识符 | 既可以是 URL，也可以是 URN（比如 ISBN:123456） | 

    👉 URL 是 URI 的一个子集，URL 强调“能访问”，URI 强调“能标识”。
- **Suites**（什么时候的软件？）
  指定适用的发行版版本（如 `noble`、`focal`）。
  ```ini
  Suites: noble noble-updates noble-backports  # 一行定义多个
  ```
  等效于 `.list` 文件的多行：
  ```bash
  deb http://.../ubuntu/ noble main
  deb http://.../ubuntu/ noble-updates main
  deb http://.../ubuntu/ noble-backports main
  ```
  | 值                | 含义                          | 示例发行版代号       |
  |-------------------|-----------------------------|---------------------|
  | `noble`           | 当前稳定版（Ubuntu 24.04）     | `jammy` (22.04)     |
  | `noble-updates`   | 稳定版的后续更新               | `jammy-updates`     |
  | `noble-backports` | 从新版本回溯移植的软件包        | `jammy-backports`   |
  | `noble-security`  | 安全更新                       | `jammy-security`    |
  | `testing`         | 测试中的下一个版本（不稳定）     | Debian 专用         |
  | `unstable`        | 开发中的最新版本（高风险）       | Debian 专用         |
- **Components**（什么性质的软件？）
  指定软件包的分类或许可类型，决定从哪个「软件分组」获取包（如开源软件、闭源驱动等）。常见取值如下：
  | 值             | 含义                          | 包含内容示例         |
  |----------------|-----------------------------|---------------------|
  | `main`         | 官方支持的开源软件             | Linux 内核、APT     |
  | `restricted`   | 官方维护的闭源软件              | NVIDIA 驱动         |
  | `universe`     | 社区维护的开源软件              | FFmpeg、Wine        |
  | `multiverse`   | 非自由的闭源软件                | Steam、某些固件     |
  | `contrib`      | 依赖非自由组件的自由软件（Debian）| 某些显卡工具         |


- **Signed-By**
  - 方式 1：内联 PGP 块
    ```ini
    Signed-By: -----BEGIN PGP PUBLIC KEY BLOCK-----
    mQINBGa81I4...
    =gPi7
    -----END PGP PUBLIC KEY BLOCK-----
    ```
    适用于不想额外管理密钥文件的场景（如 PPA）。
  - 方式 2：引用外部密钥文件 
    ```ini
    Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
    ```
    更规范，便于集中管理密钥。

### 密钥类 {#密钥类}
经常改动的部分。根据密钥管理机制来看，分为新旧两种。
#### 传统 APT 密钥管理：全局密钥环
- **`/etc/apt/trusted.gpg`**：主密钥环文件，二进制格式，包含所有受信任的 GPG 公钥（Ubuntu 官方密钥 + 手动添加的第三方密钥）。
- **`/etc/apt/trusted.gpg.d/`**：分拆的密钥文件目录，每个 `.gpg` 或 `.asc` 文件代表一个密钥，会被自动合并到全局信任链。

查看方式：
```bash
binzz@C7VF:/etc/apt/sources.list.d$ apt-key list  
Warning: apt-key is deprecated. Manage keyring files in trusted.gpg.d instead (see apt-key(8)).
/etc/apt/trusted.gpg
--------------------
pub   rsa4096 2019-05-30 [SC] [过期于：2025-06-01]
      C1CF 6E31 E6BA DE88 68B1  72B4 F42E D6FB AB17 C654
uid             [ 过期 ] Open Robotics <info@osrfoundation.org>

/etc/apt/trusted.gpg.d/ubuntu-keyring-2012-cdimage.gpg
------------------------------------------------------
... 后续输出与这个密钥类似，省略。
```
注意到，apt-key is deprecated.
#### 新管理方式：`/usr/share/keyrings/`+`.sources`文件中的`Signed-By`
从 Ubuntu 20.04/Debian 11 开始，推荐 **弃用全局密钥环**，改为：
- **`/usr/share/keyrings/`**：独立密钥存储 
  存储各个软件源的专用密钥（如 `ros-archive-keyring.gpg`），需通过 `signed-by` 显式引用。
- **`/usr/share/keyrings/ubuntu-archive-keyring.gpg`**：系统默认信任的密钥
  Ubuntu 官方仓库的默认密钥（即使不写 `signed-by`，APT 也会自动用它验证 `archive.ubuntu.com`）。

**「FAQ」**
1. **❓为什么推荐避免全局密钥环？**
    - **安全问题**：全局密钥环意味着所有密钥互相信任。如果某个第三方密钥被泄露，攻击者可伪造任意软件包。
    - **维护困难**：无法精确控制哪个密钥验证哪个软件源。

2. **❓如何迁移到新方式？**
示例步骤如下：
    1. **将密钥从 `trusted.gpg.d/` 迁移到 `/usr/share/keyrings/`**
        ```bash
        sudo cp /etc/apt/trusted.gpg.d/ros.asc /usr/share/keyrings/ros-archive.gpg
        sudo gpg --dearmor /usr/share/keyrings/ros-archive.gpg  # 确保是二进制格式
        ```
    2. **更新 `sources.list` 显式指定密钥**
        ```bash
        echo "deb [signed-by=/usr/share/keyrings/ros-archive.gpg] http://packages.ros.org/ros/ubuntu focal main" | sudo tee /etc/apt/sources.list.d/ros.list
        ```
    3. **清理旧密钥（可选）**
        ```bash
        sudo rm /etc/apt/trusted.gpg.d/ros.asc
        sudo apt-key list  # 确认密钥已移除
        ``` 

### 优先级类
有时改动的部分，尤其是遇到依赖或有强制安装或禁用的需求时。
- **`/etc/apt/preferences.d/`**：存放优先级配置文件，采用Pin策略。

文件内容示例：

```
Package: <包名或通配符>
Pin: <匹配条件>
Pin-Priority: <优先级数值>
```

你可能会看到多个这样的块，一个文件里写多个也行。
- **Package**：要应用这个策略的包名。可以用 `*` 匹配全部包。
- **Pin**：用来描述从哪个源来的包适用这个策略，有多种写法。
  | 示例 | 说明  | 
  | --- | ---- | 
  | Pin: release o=Ubuntu | 来源的发行商为Ubuntu 官方源   |
  | Pin: release n=focal  | 发行代号（如 focal、jammy）。用来固定 Ubuntu 版本 |
  | Pin: origin packages.ros.org | 来源服务器为ROS 官网 |
  | Pin: version 1.2.3 | 指定版本号为1.2.3 |
- **Pin-Priority**：数值决定优先级。越高越容易被选中，低于100不会被自动安装。
  | 数值范围     | 含义                       |
  | -------- | ------------------------ |
  | < 0    | 完全禁止安装                   |
  | 1 ~ 99 | 不自动装，只有手动才会装          |
  | 100    | 默认行为          |
  | > 100  | 提升优先级，会覆盖掉别的源的版本         |
  | 1001   | 强制安装，即使版本更旧也照样装（常用于降级） |
可以使用`apt policy`命令查看每个包的优先级情况，详情在[policy](#policy)一节中讨论。


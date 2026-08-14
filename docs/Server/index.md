---
title: 服务器架设
next: 
    text: 网络知识
    link: /Server/网络知识.md
---
  
# {{ $frontmatter.title }}

## 查看公网IP
```bash
curl cip.cc
```
**Q：** 我查到了自己电脑的公网IP，该电脑也开启了 sshd 服务，为什么我用 SSH 连不上？

**A：** 因为该电脑的端口被运营商限制了，无法直接通过公网IP连接，我也没有打破这个限制的权限，需要通过[内网穿透](FRP.md)来解决。


## 用命令行连接无线网络
GUI的联网工具不能那么实时地更新周围的网络情况，经常需要我手动刷新。为了适应在服务器方面几乎使用命令行的需求，也需要用纯命令行的方式连接。

安装 Network Manager：
```bash
sudo apt install network-manager
```
1. 连接无线网络
    通常电脑开机时，无线网络是打开的。
    ```bash
    nmcli device wifi connect "SSID" password "PASSWORD"
    ```
    其中SSID是第2步未经`grep`（即`nmcli device wifi list`）输出的一个字段，即网络名称。在这里是 WLAN1。如果要连接 WLAN1，则：
    ```bash
    nmcli device wifi connect "WLAN1" password "PASSWORD"
    ```
    其中PASSWORD是我设置的密码。
    连不上。但此时手机的无线中继是打开的，意味着 WLAN1 理应被电脑识别到。
2. 查看可用的无线网络
    ```bash
    nmcli device wifi list | grep WLAN1
    ```
    没找到。
3. 刷新可用的无线网络
    ```bash
    nmcli device wifi rescan
    ```
    再按上一步，就可以看到 WLAN1 了。
4. 按第一步，连上了 WLAN1。
5. 查看曾经连接过的网络和当前连接的网络
    ```bash   
    $ nmcli connection show
    NAME             UUID                                  TYPE      DEVICE 
    WLAN1        3ceac9c6-5796-40af-8115-cb533ccf6985  wifi      wlp4s0 
    lo               78524f5b-c04c-4462-abdf-53c1ced92757  loopback  lo     
    ETHER1       d9793e3a-72ff-3b01-89f2-7b5103b9d75d  ethernet  --     
    自动 CAMPU       14fc2598-d7d4-48fa-9236-3cccf1c0388a  wifi      --     
    自动 CAMPU-FREE  bff2d2df-d7c4-403a-9a38-ac1e1ffba30d  wifi      --     
    Auto WLAN2_5G   6889ebd5-b2c6-45c7-b4dd-ac14cbec64bb  wifi      --     
    $ 
    ```

    **Q2**：其中“自动”二字意味着什么？是在手机设置经常看到的“自动连接”吗？

    **A2**：从NAME上看，是的。

    **Q3**：电脑开机默认连接的网络是 CAMPU，偶尔需要连接 WLAN1。如果按照 Q1 中的步骤，每次都要输入密码，很麻烦。有没有什么办法可以避免这种情况，实现无密码连接 WLAN1？

    **A3**：以后可以用 `nmcli connection up "WLAN1"` 免密连接，但注意，如果要免密连接`CAMPU`，则应该是 `nmcli connection up "自动 CAMPU"` 而非 `nmcli connection up "CAMPU"`。

6. 附：打开无线网络
    ```baah
    sudo nmcli radio wifi on
    ```

## 文件传输
### scp
```bash
scp <source> <destination> [-P port]
```
- `<source>`和`<destination>`：本机或另一台设备的文件路径。
    - 本机文件路径：`/path/to/local/file_or_directory`
    - 远程文件路径：`username@remote_ip:/path/to/remote/file_or_directory`
- `-P port`：可选，指定 SSH 端口号，默认是 22。

### sftp
#### 登入
```bash
sftp <remote_username>@<remote_ip>
```
#### 交互
在 `sftp` 交互式会话中，命令的“本地”和“远程”是严格区分的。**不带前缀的命令操作的是远程服务器**，而操作本地文件系统时，需要在命令前加上 `l`（代表 Local）。

| 操作 | 本地 | 远程 |
| :--- | :--- | :--- |
| **查看当前工作目录** | `lpwd` | `pwd` |
| **列出文件** | `lls` | `ls` 或 `ls -l`（查看详细信息） |
| **切换工作目录** | `lcd 路径` | `cd 路径` |
| **新建文件、删除文件、删除目录** | 加入 `!` 前缀 | ❌不支持 |
| **新建目录** | `lmkdir 目录名` | `mkdir 目录名` |

上传：
```bash
put <local_file_or_directory>
```
下载：
```bash
get <remote_file_or_directory>
```
退出：
```bash
exit
```

在 `sftp>` 提示符下，输入 `!` 后接本地 Shell 命令（如 `!ls`、`!pwd`），可以在不退出会话的情况下执行本地操作，但**这不会改变 `sftp` 当前的本机路径记忆**，仅用于临时查看或操作。

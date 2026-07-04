---
title: 01 安装 Ubuntu 24.04.2 LTS（实机双系统）
---
  
# {{ $frontmatter.title }}

光是安装一个 Linux 发行版，就涉及许多有关 Linux 的概念。一定要胆大心细，搞清楚每一步在做什么，否则你的电脑变砖了，还不知道怎么解决。

## 获取 Linux 发行版的光盘映像（.iso）
对于新手，最好选择开箱即用的桌面发行版，例如 Ubuntu、Debian、Linux Mint、Rochy Linux等。不建议选择 Arch Linux，因为它的安装和配置成本过高，对新手并不友好，只适合爱折腾的极客们。**本文以 Ubuntu 24.04.2 LTS 为例**，介绍安装 Linux 发行版的通用方法。

### 通用镜像站 / 软件源
镜像站里可以找到大多数发行版，相较于发行版的官网，提供了更多的旧版本。
- 清华大学：https://mirrors.tuna.tsinghua.edu.cn/
- 南京大学：https://mirrors.nju.edu.cn/
- 中国科学技术大学：https://mirrors.ustc.edu.cn/
- 阿里云：https://developer.aliyun.com/mirror/
- 华中科技大学：https://mirrors.hust.edu.cn/

### Ubuntu
- 最新版本：https://ubuntu.com/download/desktop
- 近年来常用版本：https://releases.ubuntu.com/
- 所有版本，包括古早到零几年的：http://old-releases.ubuntu.com/releases/


## 记录磁盘分区
如果你安装有Windows系统，建议你在Windows中打开磁盘管理，**记录好每个磁盘、磁盘中每个分区的各种属性，包括大小、文件系统、磁盘分区形式等。** 因为Linux系统下对磁盘分区的描述与Windows不同，认为一个磁盘或磁盘分区就是一个文件，需要将文件名与Windows的各种盘一一对应。例如，Windows的C盘在Linux下的名称可以是 `/dev/nvme0n1p3`。

若没有安装Windows系统，则用其他方法将分区与文件名对应。

![在Windows磁盘管理中查看分区](assets/instubuntu-1.png)

### 重要分区
- **EFI System Partition**：启动分区。如果一块磁盘没有 EFI System Partition，或其 EFI System Partition 中的文件被破坏，则整块磁盘中安装的操作系统就不能启动，使得电脑启动不能进入该磁盘上的任何操作系统。电脑开机时，首先进入 BIOS/UEFI（后文简称BIOS）。BIOS 检索 EFI System Partition 中所有的引导项。如果没有用户的干预，BIOS 会自动加载默认的引导项，运行的软件由BIOS转向该引导项对应的软件，通常来说，就是某个操作系统了。所以每个能运行的操作系统都有自身的引导项。至于如何干预，从而修改默认引导项或加载其他引导项，见[“设置BIOS”](#设置BIOS)和[“进入安装程序”](#进入安装程序)。
    - **BIOS（Basic Input/Output System，基本输入输出系统）** 本质上是一种软件，是电脑开机时运行的第一个程序，而UEFI（Unified Extensible Firmware Interface）是更高级的 BIOS。
    - 自己的电脑用的是BIOS还是UEFI（BIOS模式）？见[“查看系统信息”](05-系统维护.md#查看系统信息)。

### 文件系统
- **FAT32**：EFI System Partition 往往采用 FAT32 文件系统，在上图中为 `磁盘0 磁盘分区1`。FAT32 的适用分区不局限于 EFI System Partition。iOS 对此具有读写权限。
- **NTFS**：适用于Windows的C、D、E盘等。iOS对此只有只读权限。
- **ext4**：适用于Linux，是 Debian 系发行版的默认文件系统。iOS不支持。
- **swap**：交换分区，用于临时存储数据，当物理内存不足时，会将一部分数据存储到交换分区中。安装Linux发行版时，建议分配1~2GB的交换分区。当然不分配的话，系统也可以正常运行。如果你的系统用到了交换分区，那只能说，你要加内存条了。
- **xfs**：适用于Linux，是 Red Hat 系发行版的默认文件系统。

### 分区状态
描述着各个分区是否正常，以及该分区的功能。
### 磁盘分区形式
描述着各个分区的结构，比如MBR、GPT等。现在的一般都使用**GPT**分区形式，因为GPT分区形式支持更大的磁盘，并且支持更多的分区。

## 关闭Windows的BitLocker
如果不关闭，改动BIOS，则Windows系统会被锁定，无法使用。虽然Windows官方声称遇到BitLocker锁定Windows时可以通过密钥解锁，但在实操中往往输入了密钥也解锁不了，只能重新安装Windows，和自己的数据说拜拜。

在Windows的设置中搜索BitLocker，关闭即可。关闭后，磁盘管理窗口中的相应磁盘分区（C、D、E盘）不会有BitLocker的字样。

## 制作启动U盘
1. **备份U盘数据。这是极其重要的一步！** 因为制作启动U盘需要将U盘格式化，清空U盘内的数据。
2. 下载启动盘制作工具 [Ventoy](https://www.ventoy.net/cn/download.html)。
![下载启动盘制作工具1](assets/instubuntu-2.png)
3. 以Windos版本为例，解压，打开`Ventoy2Disk.exe`。
![下载启动盘制作工具2](assets/instubuntu-3.png)
4. 选择待安装的设备，即待制作成启动U盘的U盘。
![选择待安装的设备](assets/instubuntu-4.png)
5. 配置选项 $\rightarrow$ 分区类型 $\rightarrow$ MBR
![配置分区类型为MBR](assets/instubuntu-5.png)
6. 配置选项 $\rightarrow$ 分区设置 $\rightarrow$ 文件系统 $\rightarrow$ exFAT或NTFS
![配置文件系统](assets/instubuntu-6.png)
注意，iOS对NTFS文件系统只有只读权限，而对exFAT文件系统有读写权限。换言之，对于NFTS文件格式的U盘，在iPad上只能读取，而不能更改其内容。如果这个U盘还需要插到苹果设备上，则选择exFAT文件系统。
7. 点击“安装”。会弹出窗口向你反复确认，是为了确保你备份好了U盘数据，以免丢失。确认好了，就大胆点那几个“是”吧！恭喜你，制作好了启动U盘，进入一个全新的世界！
![点击安装](assets/instubuntu-7.png)
8. 把备份的文件、光盘映像拷入启动U盘。所有的光盘映像文件都可以拷入以上述方法制作的启动U盘的任意目录内而被识别。这样，你的启动U盘就可以用来安装系统，也可以把里面系统当作一个行走的临时系统，称为 **Live CD**。


## 设置BIOS {#设置BIOS}
重启电脑，自动进入BIOS。在此期间，如果用户按相应快捷键，就可以对BIOS进行干预。分外两种：设置BIOS、切换启动的引导项（后文简称启动项）。本节谈的是设置BIOS。

按键一定要及时按。不知道什么时机按的话就一直狂按，试出到底应该在什么时候按，通常是开机后立即、屏幕出现厂商Logo时。

不同主板或品牌的电脑的 BIOS 快捷键有差异。本文会在用到时给出，如果没有提到你的电脑机型，请依然参考给出的热键并逐个尝试。

### 进入BIOS设置
我这边是 Delete 键。参考快捷键如下：
| 机型 | 进入BIOS设置的按键 |
| :--: |  :--: |
| IBM/ThinkPad | F1（部分机型 Fn+F1 或 F2） |
| 惠普 HP | F2 或 F10（部分需先按 ESC 再按 F10） |
| 索尼 Sony | F2 或 ASSIST 键 |
| 戴尔 Dell、宏碁 Acer、华硕 Asu、神舟 Hasee、Phoenix BIOS | F2 |
| 东芝 Toshiba | ESC 后按 F1，或直接 F2 |
| 联想 Lenovo | F2 或 Fn+F2（部分需关机按 Novo 键） |
| 微星 MSI、Award BIOS | Delete |
| 其他品牌（小米、海尔、技嘉等） | 多为 F2 |

不同电脑出现的BIOS界面和操作方法都截然不同，但在设置选项方面，基本相同，还会有帮助信息。我这边的帮助信息如下：

![BIOS帮助信息示例](assets/instubuntu-8.png)

参考：
https://zhuanlan.zhihu.com/p/714232360
https://developer.aliyun.com/article/1172646

### 关闭Secure Boot
![关闭Secure Boot](assets/instubuntu-9.png)

### 设置启动顺序 & 修改默认引导项
根据个人喜好设置。启动顺序越优先的引导项，越会是默认引导项。例如，我把U盘（USB硬盘）放在第一位，如下图所示。则电脑启动时，如果识别到U盘，就会启动U盘上的引导项。如果没有，才会尝试第二个（在下图中是 Windows Boot Manager）、第三个……。
![设置启动顺序&修改引导项](assets/instubuntu-10.png)

### 保存并退出
![保存BIOS设置并退出](assets/instubuntu-11.png)

## 进入 Linux 发行版的安装程序 {#进入Linux发行版安装程序}
插入电源、带有光盘映像文件的启动U盘，重启电脑，切换启动项，参考快捷键如下。我这边是 F11。
![BIOS切换启动项按键](assets/instubuntu-12.png)
依次选择USB硬盘、发行版的光盘映像、Boot in normal mode、Try or install，即可进入发行版系统。在桌面上选择Install，即可开始安装发行版。
![BIOS/UEFI画面](assets/instubuntu-13.png)
![Ventoy菜单](assets/instubuntu-14.png)
![Ventoy菜单](assets/instubuntu-15.png)
![GRUB菜单](assets/instubuntu-16.png)

大部分的发行版会弹出一个窗口指导你安装，相当用户友好，只是有一步值得好好讲讲——分区。


### 分区
大多数的安装界面的分区，有共存、抹掉、手动分区三种方式，如下图所示。以手动分区为例进行说明。手动分区弄明白了，其他两个选项自然懂。

![如何分区](assets/instubuntu-17.png)

在上图的基础上，点击“下一步”，画面如下。思考待安装的 Ubuntu 占用的总空间，建议不少于50G。
![如何分区](assets/instubuntu-18.png)

### 确认信息并安装
仔细检查分区是否正确，并填写用户名、密码、时区等信息，确认完毕后点击“安装”按钮即可，大概等待十几分钟，够喝一杯咖啡了。安装完毕后重启电脑，进入 Ubuntu 系统。

## Ubuntu，启动！
### 必备软件安装
#### 显卡驱动
如果有不能调整屏幕亮度、不能连接无线网络、无声音等问题，很可能是显卡驱动的问题。假设你的显卡是 NVIDIA 的。

**参考链接**
- 安装参考：https://blog.csdn.net/Sihang_Xie/article/details/127347139
- 官方文档：https://docs.rockylinux.org/10/zh/desktop/display/installing_nvidia_gpu_drivers/

**安装步骤**
1. 卸载残留的NVIDIA驱动（防止冲突）。如果你之前从来没有安装过NVIDIA驱动，请跳过这一步，以免误删。
	```bash
	sudo apt-get purge '^nvidia-.*'
	sudo apt-get autoremove
	```
2. 安装推荐的NVIDIA驱动
网上很多说法是安装 `ubuntu-drivers devices` 输出中推荐的驱动版本，比如推荐590，就是`sudo apt install nvidia-driver-590`，或者直接`sudo ubuntu-drivers autoinstall`，即可自动安装推荐的驱动版本，不需要看推荐。两者等效。
	这两种方法都我试过，安装了之后重启，不仅没有解决驱动问题，连无线网络都不能用了。所以**不要听它的推荐！！！**
	具体要安装哪个驱动版本，要根据你的显卡型号来定，到 [官网](https://www.nvidia.com/en-us/drivers/) 去查吧！
	获取显卡型号：

	```bash
	binzz@C7VF:~$ lspci | grep -i nvidia
	01:00.0 VGA compatible controller: NVIDIA Corporation AD107M [GeForce RTX 4060 Max-Q / Mobile] (rev a1)
	01:00.1 Audio device: NVIDIA Corporation Device 22be (rev a1)
	binzz@C7VF:~$ 
	```
	可知，我的显卡型号是`GeForce RTX 4060`，在官网上查到支持的驱动版本是580，所以我应该安装580版本的驱动，即 `sudo apt install nvidia-driver-580`。
3. 重启系统
	```bash
	sudo reboot
	```
4. 重启后验证驱动是否激活
	```bash
	nvidia-smi
	```
	如果看到显卡信息就说明装成功了。



#### 中文输入法
有的系统要用 `fcitx5`，如 Linux Mint：
```bash
sudo apt install fcitx5-chinese-addons
```
有的要用 `ibus`，如 Ubuntu：
```bash
sudo apt install ibus ibus-pinying
```

#### 时间同步
参考：https://www.bilibili.com/video/BV1Cc41127B9?spm_id_from=333.788.videopod.episodes&vd_source=41762f42bb4d911326d3416fb75583bc&p=18
```bash
sudo apt install ntpdate
sudo ntpdate time.windows.com
sudo apt install util-linux util-linux-extra 
sudo hwclock --localtime --systohc
```

---
title: 07 Bash 与终端
---

# {{ $frontmatter.title }}

## 壳程序（Shell）及其分类
Shell 是一个用 C 语言编写的程序，是用户使用 Linux 的桥梁，用户通过 Shell 访问操作系统内核的服务。打开终端时，会自动启动一个 Shell。

Shell 既是一种命令语言，又是一种程序设计语言。说它是命令语言，因为在它上面可以执行命令，实现对Linux的操作；说它是程序设计语言，因为它对应一种脚本语言，叫做 Shell Script。业内通常说的 Shell 是指 Shell Script，而不是Shell本身。

Shell 的分类如下:
- **longin shell**：用户进入时需要登录的Shell。例如按下 Ctrl + Shift + Fx 键，会进入ttyx，首先就需要用户输入用户名和密码。（Ubuntu中x的取值范围是3-6，x取1时是锁屏界面，取2时是Ubuntu的图形界面）
- **non-login shell**：用户进入时不需要登录的Shell。
  - `interactive non-login shell`：交互式的 non-login shell。例如按下 Ctrl + Alt + T 键弹出的终端窗口。
  - `non-interactive non-login shell`：非交互式的non-login shell。例如执行一个Shell脚本（.sh文件）。

在 Linux 中，默认的 Shell 是 bash。还可以使用其他 Shell，例如 `zsh`、`fish` 等，甚至是微软出品的 PowerShell，可以参考官网或通过包管理器安装。


## 常用快捷键
| 快捷键 | 功能 |
| --- | --- |
| Ctrl + Alt + T（要看桌面环境） | 打开终端 |
| Ctrl + Shift + T（要看终端程序） | 新建终端标签页 |
| Ctrl + F 或 ⟶ | 光标向右移动一个字符 |
| Ctrl + B 或 ⟵ | 光标向左移动一个字符 |
| Ctrl + A 或 Home | 光标移动到行首 |
| Ctrl + E 或 End | 光标移动到行尾 |
| Ctrl + U | 删除光标左侧的所有字符 |
| Ctrl + K | 删除光标右侧的所有字符 |
| Ctrl + Y | 粘贴刚刚删除的内容 |
| Ctrl + L | 清屏，但还会找到前面命令的输出，要与clear区分开 |
| Ctrl + C | 终止当前命令 |
| Ctrl + Z | 将当前命令放入后台 |
| Ctrl + D | 退出当前终端 |
| Ctrl + R | 搜索历史命令 |
| Ctrl + S | 暂停在终端显示内容。有时在终端显示不出输入内容的原因，可能是误触了这个快捷键。按Ctrl + Q恢复显示。 |
| Ctrl + Q | 恢复在终端显示内容。 |
| Alt + F | 光标向右移动一个单词 |
| Alt + B | 光标向左移动一个单词 |
| Alt + D | 删除光标右侧的一个单词 |
| Alt + Backspace | 删除光标左侧的一个单词 |
| Ctrl + W | 删除光标左侧的一个单词 |
| Alt + . | 重复上一个命令 |
| Alt + / | 执行不带颜色的 ls -a 命令 |
| Alt + 1-9 | 切换到第1-9个终端标签页 |
| Shift + PageUp | 向上滚动一页 |
| Shift + PageDown | 向下滚动一页 |
| Shift + Home | 移动光标到行首 |
| Shift + End | 移动光标到行尾 |

## 命令补全功能
```bash
u0_a278@localhost:~$ ssh-keygen -t  # 按Tab补全，理应出现ed25519之类
.bash_history     .config/          .local/           .suroot/          .viminfo          storage/
.bashrc           .gitconfig        .python_history   .termux/          hello.sh          
.cache/           .lesshst          .ssh/             .termux_authinfo  learngit/         
u0_a278@localhost:~$	# 这说明 Termux 没有足够的补全功能，如何解决？
```
需安装 `bash-completion`，然后在 `~/.bashrc` 中添加以下内容：
```bash
# 加载 bash 补全
if [ -f $PREFIX/share/bash-completion/bash_completion ]; then
    . $PREFIX/share/bash-completion/bash_completion
fi
```
最后 `source ~/.bashrc` 即可。

## 终端复用 Tmux
参考教程：https://www.runoob.com/linux/linux-comm-tmux.html
```bash
sudo apt install tmux
```
大致是像这样，拆分窗口：
![alt text](assets/bash-1.png)

又远非拆分窗口（不然和 terminator 有什么区别呢），还可以保存会话记录呢！仅凭 tmux 自身的功能，保存会话的前提是不重启系统。不过安装[适当的插件](https://github.com/tmux-plugins/tmux-resurrect)，即使是重启系统，也可以恢复会话，这就是 tmux 的强大之处！

tmux 的三要素是，会话（Session）、窗口（Window）、面板（Panel）的概念。

从图中可以看出，当前会话叫做 example，有三个窗口分别叫 window1、window2、bash，目前第 0 个窗口 window1（右边有个星号），上一次所在窗口为 window2（右边有个减号）。window1被拆分成了图中的三块。

tmux 的每个指令都有一个前缀键，默认是 Ctrl + b（^b），然后再输入命令键。

### 进入 tmux 会话
```bash
# 查看所有会话
tmux ls
# 进入某一个会话
tmux attach -t <会话名>
# 进入最近的会话
tmux attach
# 创建新会话
tmux new-session -s <会话名>
# 如果这个会话只是临时性的，不需要保存，懒得起名字，则这样创建会话
tmux
```

### 在 tmux 会话中
```bash
^b c                 # 创建新窗口
^b %                 # 水平拆分面板
^b "                 # 垂直拆分面板

^b <arrow>           # 切换面板
^b n                 # 切换到下一个窗口
^b p                 # 切换到上一个窗口
^b <num>             # 切换到第<num>个窗口
^b s                 # 切换会话，会提示你选择

^b space             # 切换面板布局
^b z                 # 最大化/恢复当前面板

^b $ <新会话名>      # 重命名当前会话
^b , <新窗口名>      # 重命名当前窗口

^b x                 # 关闭当前面板
^b &                 # 关闭当前窗口
^b d                 # 退出当前会话，保存会话记录
^d                   # 退出当前会话，不保存会话记录（杀死会话）
```





## 启动机制 {#启动机制}
| 类型  | 启动机制 |
| ---- | ---- |
| **login shell** | 读取 `/etc/profile` 和 `~/.bash_profile`（或 `.bash_login`、`.profile`）。 依次查找有没有这些文件，只要有其中一个就执行这个，其他的都不看了。 |
| **interactive non-login shell**  | 执行 `~/.bashrc`|
| **non-interactive non-login shell** | 不读取 `~/.bashrc`，也不读取 login 配置。环境继承自父进程的环境变量。  |

这些文件都可以修改，改变 Bash 的行为。

## 环境变量
### 系统全局生效的环境变量：`/etc/environment`
```bash
binzz@C7VF:~$ cat /etc/environment
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
binzz@C7VF:~$ 
```

## 提示词
### PS1
```bash
binzz@C7VF:~$ echo $PS1
\[\e]0;\u@\h: \w\a\]${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$
binzz@C7VF:~$ 
```
解析一下当前的`PS1`。另外可以执行`man bash`，查找`PS1`，阅读相关说明。
可参考：https://cn.linux-console.net/?p=15675

#### 窗口标题
```bash
\[\e]0;\u@\h: \w\a\]
```
`\[`和`\]`分别代表非打印字符的开始和结束。非打印字符不会显示在终端，而是用于控制终端的行为。参见[颜色字体控制](#颜色字体控制)一节。现讨论两者之间的部分：
```bash
\e]0;\u@\h: \w\a
```
- `\e`：一个ESC字符，是任意[ANSI转义序列](https://zh.wikipedia.org/wiki/ANSI%E8%BD%AC%E4%B9%89%E5%BA%8F%E5%88%97)的开头。
- `]`：开始一个 OSC（Operating System Command）序列（是ANSI序列的一种）。其后的数字代表序列的参数。
- `0;`：代表设置窗口标题。
- `\u`：用户名。在这里是 binzz。
- `@`：就是一个普通的字符，`@`本身。
- `\h`：主机名。在这里是 binzz-Alpha-17-C7VF。
- `:`：就是一个普通的字符，`:`本身。
- `\w`：当前工作目录的绝对路径。
- `\a`：响铃字符。

综上，窗口标题显示为：
![窗口标题显示](assets/bash-2.png)
`${debian_chroot:+($debian_chroot)}`：如果`debian_chroot`变量存在且不为空，则该式的值为`debian_chroot`的值，否则该式的值为空。

#### 颜色、字体控制 {#颜色字体控制}
一般格式为：
```bash
\[\033[文字样式;前景色;背景色m\]
```
属于ANSI序列的[选择图形再现（SGR）](https://zh.wikipedia.org/wiki/ANSI%E8%BD%AC%E4%B9%89%E5%BA%8F%E5%88%97#%E9%80%89%E6%8B%A9%E5%9B%BE%E5%BD%A2%E5%86%8D%E7%8E%B0%EF%BC%88SGR%EF%BC%89%E5%8F%82%E6%95%B0)。在本例中，`\[\033[01;32m\]`代表加粗绿色文字，`\[\033[00m\]`代表恢复默认样式（透明背景、没有任何特殊样式的白色文字），`\[\033[01;34m\]`代表加粗蓝色文字，使得本例的提示文字显示为：
![提示符显示](assets/bash-3.png)
##### 文字样式
| 文字样式  | 数值 | 文字样式 | 数值 |
| :----: | :--: |:----: | :--: |
| 普通     | 0  | 反显     | 7  |
| 加粗     | 1  | 清除所有样式 | 0  |
| 下划线    | 4  |

##### 前景色（文字颜色）{#前景色}
| 颜色 | 数值 | 颜色 | 数值 |
| :--: | :--: | :--: | :--: |
| 黑  | 30 | 蓝     | 34 |
| 红  | 31 | 品红    | 35 |
| 绿  | 32 | 青（青绿） | 36 |
| 黄  | 33 | 白     | 37 |

##### 背景色
数值在[前景色](#前景色)表格的基础上+10。

### PS2
`PS2`是多行命令的提示词，一般为`>`。
```bash
binzz@C7VF:~$ echo $PS2
>
binzz@C7VF:~$ cd \
> \
> 桌面
binzz@C7VF:~/桌面$ PS2=">** "
binzz@C7VF:~$ cd \
>** \
>** 
binzz@C7VF:~$ 
```

## 输入输出重定向
### 将输出重定向到剪贴板
使用 `xclip` 工具，需要安装，仅支持 Shell 环境。
例如：
```bash
echo "hello world" | xclip -selection c
```
查看剪贴板内容：
```bash
xclip -o
```

## 字符串处理
### cut
```bash
# 我想提取文件名吖
binzz@MSI713:/$ ll | head -n5
total 1492
drwxr-xr-x  22 root root    4096  7月  6 10:27 ./
drwxr-xr-x  22 root root    4096  7月  6 10:27 ../
lrwxrwxrwx   1 root root       7  4月 22  2024 bin -> usr/bin/
drwxr-xr-x   2 root root    4096  2月 26  2024 bin.usr-is-merged/
空格数    01234    012  012345  0123 0120123  012

# 文件名在第九列，用cut来try一try
binzz@MSI713:/$ ll | head -n5 | cut -d " " -f9
# 空行
4096 # 来自第二行
4096 # 来自第三行
# 空行
# 空行
```
纳尼？为什么没有文件名？这是因为`cut`的分隔符只取一个，所以各行的`-f<num>`如下：
| 行号 | -f2  | -f3   | -f4 |
| :--: | :--: | :--: | :--: |
| 1    | 1492 |      |      |
| 2、3 |      |  22  | root |
| 4    |      |      |   1  |
| 5    |      |      |   2  |

单元格为空的说明是空字符。`cut`只适合分隔符长度（在这里是每列间的空格数）一致（最好都是1）的情况。

### date
#### 案例一：根据天数计算日期
用户的密码存放在`/etc/shadow`文件中，每个字段由`:`分隔，第三个字段是更动密码的日期距离 1970-01-01 的天数。下面通过`date`命令来计算`binzz`更改密码的日期。
```bash
# 获取天数
binzz@VirtualBox:~$ sudo cat /etc/shadow | grep binzz     
binzz:<密码的密文，一长串，省略>:20106:0:99999:7::: # 就是20106啦

# 计算日期
binzz@VirtualBox:~$ date --date="@$((20106*24*3600))" +%F
2025-01-18 
```

对应`date`的帮助信息为：
```bash
%F	完整日期格式，等价于 %Y-%m-%d

将 epoch（1970-01-01 UTC）以来的秒数转换为日期
  $ date --date='@2147483647'
```

#### 案例二：我的人生走过了多少天
```bash
# 计算天数
binzz@VirtualBox:~$ echo $(( ( $(date +%s) - $(date +%s --date='2004-2-15') ) / (24*3600) ))
7837

# 如果你知道你出生时是几点钟，结果会更精确哟！
binzz@VirtualBox:~$ echo $(( ( $(date +%s) - $(date +%s --date='2004-2-15 15:30') ) / (24*3600) ))
7836
binzz@VirtualBox:~$ date
2025年 07月 31日 星期四 10:58:12 CST

# 只说日期，但不说时分秒的，认为是00:00:00
binzz@VirtualBox:~$ date +'%F %X' --date='1970-1-1'
1970-01-01 00时00分00秒
binzz@VirtualBox:~$
```
朱自清《匆匆》里说，他的人生度过了八千多天。那么我的人生过了整整8000天的日子是哪一天呢？
```bash
binzz@VirtualBox:~$ date +%F --date="@$(( $(date +%s --date='20040215') + 8000*24*3600  ))"
2026-01-10
binzz@VirtualBox:~$ 
```
<span style="color:red">【易错题】</span>抛开生日这个话题，问某天距1970-01-01有多少天？

```bash
# 以2005-8-6为例
binzz@VirtualBox:~$ echo $(( $(date +%s --date='2005-8-6')/(24*3600) )) # ❌多么美丽的错误
13000 # 嗯，真的很美丽
binzz@VirtualBox:~$ echo $(( $(date +%s --date='2005-8-6')/(24*3600)+1 )) # ✅正解
13001
binzz@VirtualBox:~$ 
```
为什么第一个看似正确的答案是不对的呢？因为时间戳是相对于 `1970-01-01`早上八点的，而`--date='2005-7-31'` 其实是 `2005-7-31 00:00:00`，`$(( ))` 这样的`bash`运算只支持整数。如果你要知道 `1970-01-02`是多少天，还用第一句，得到的结果是0，显然不对，应该是1天，所以要像第二句一样加1。

#### 案例三：探寻古老的日期
```bash
# 尝试1970年之前的日期
binzz@C7VF:~$ echo 度过了$(( ( $(date +%s) - $(date -d '19640215' +%s) ) / (24*3600) ))天             
度过了22623天
binzz@C7VF:~$ cal 2 1964
      二月 1964         
日 一 二 三 四 五 六  
                   1  
 2  3  4  5  6  7  8  
 9 10 11 12 13 14 15  
16 17 18 19 20 21 22  
23 24 25 26 27 28 29  

# 尝试更古老的月                      
binzz@C7VF:~$ cal 2 164        
       二月 164         
日 一 二 三 四 五 六  
       1  2  3  4  5  
 6  7  8  9 10 11 12  
13 14 15 16 17 18 19  
20 21 22 23 24 25 26  
27 28 29              

# 164年的时间戳只比1964年多2位！！！怪不得连164年都可以算！
binzz@C7VF:~$ date -d '19640215' +%s
-185529600
binzz@C7VF:~$ date -d '01640215' +%s   
-56988000343

# 公元前怎么办？                      
binzz@C7VF:~$ cal 2 -164    
cal: 无效的选项 -- 6
Usage: cal [general options] [-jy] [[month] year]
       cal [general options] [-j] [-m month] [year]
       ncal -C [general options] [-jy] [[month] year]
       ncal -C [general options] [-j] [-m month] [year]
       ncal [general options] [-bhJjpwySM] [-H yyyy-mm-dd] [-s country_code] [-W number of days] [[month] year]
       ncal [general options] [-Jeo] [year]
General options: [-31] [-A months] [-B months] [-d yyyy-mm]

# 这个月怎么没有3到13号？？？
# 因为这个时候英国将儒略历改用为格里高利历了，以纠正误差。
binzz@C7VF:~$ cal 9 1752    
      九月 1752         
日 一 二 三 四 五 六  
       1  2 14 15 16  
17 18 19 20 21 22 23  
24 25 26 27 28 29 30  
                      
                      
                      
binzz@C7VF:~$
```


### join
```bash
# 1. 显示文件内容
binzz@C7VF:~$ sudo head -n 3 /etc/passwd /etc/shadow
==> /etc/passwd <==
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin

==> /etc/shadow <==
root:*:20134:0:99999:7:::
daemon:*:20134:0:99999:7:::
bin:*:20134:0:99999:7:::

# 2. 按书上来的
binzz@C7VF:~$ join /etc/passwd /etc/group -t ":" -1 4 -2 3 | head -n 3
join: 0:root:x:0:root:/root:/bin/bash:root:x:
/etc/passwd:6: 未排序：games:x:5:60:games:/usr/games:/usr/sbin/nologin1:daemon:x:1:daemon:/usr/sbin:/usr/sbin/nologin:daemon:x:

2:bin:x:2:bin:/bin:/usr/sbin/nologin:bin:x:

# 3. 为什么不对
binzz@C7VF:~$ join $(head -n 3 /etc/passwd) $(head -n 3 /etc/group) -t ":" -1 4 -2 3
join: 多余的操作对象 'bin:x:2:2:bin:/bin:/usr/sbin/nologin'
请尝试执行 "join --help" 来获取更多信息。

# 4. 达到了书上的目的
binzz@C7VF:~$ join <(head -n 3 /etc/passwd) <(head -n 3 /etc/group) -t ":" -1 4 -2 3
0:root:x:0:root:/root:/bin/bash:root:x:
1:daemon:x:1:daemon:/usr/sbin:/usr/sbin/nologin:daemon:x:
2:bin:x:2:bin:/bin:/usr/sbin/nologin:bin:x:
```

3.和4.区别在于 **参数传递的方式**，这涉及到 Shell 的 **命令替换** (`$()`) 和 **进程替换** (`<()`) 的不同行为：

#### 3.为什么失败？
`$(head -n 3 /etc/passwd)` 会执行命令替换，将 `head -n 3 /etc/passwd` 的输出作为 **字符串** 直接替换到命令中。导致 `join` 看到的参数是：
  ```bash
  join "root:x:0:0:root:/root:/bin/bash" "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin" "bin:x:2:2:bin:/bin:/usr/sbin/nologin" ... -t ":" -1 4 -2 3
  ```
这显然不符合 `join` 的语法，因为 `join` 需要的是 **文件名**，而不是直接的文件内容。

```
join: 多余的操作对象 'bin:x:2:2:bin:/bin:/usr/sbin/nologin'
```
这个错误表示 `join` 把 `bin:x:2:2:bin:/bin:/usr/sbin/nologin`（`/etc/passwd` 的第三行）当作了一个额外的参数，而不是文件名。

#### 4.为什么成功？
`<(head -n 3 /etc/passwd)` 是 **进程替换**，它会：
1. 创建一个 **临时命名管道（FIFO）** 或 **临时文件**（取决于 Shell 实现）。
2. 把 `head -n 3 /etc/passwd` 的输出写入这个临时文件。
3. 把临时文件的 **路径**（如 `/dev/fd/63`）传递给 `join`。

因此，`join` 实际看到的是：
```bash
join /dev/fd/63 /dev/fd/64 -t ":" -1 4 -2 3
```
这样 `join` 就能正确读取文件内容，而不是把内容当作参数。

#### 关键区别&总结
| 方式 | 行为 | 适用场景 |
|------|------|----------|
| `$(command)`（命令替换） | 直接替换为 **字符串** | 适用于需要 **文本内容** 的场景（如 `echo $(date)`） |
| `<(command)`（进程替换） | 替换为 **临时文件路径** | 适用于需要 **文件名** 的场景（如 `join`、`diff`、`paste`） |


### sed
#### 替换操作中匹配模式或替换文本含“/”的情况
`'s/<匹配模式>/<替换文本>/g'`
```bash
# 以${PATH}为例，去掉最后一项 :/usr/local/games/
binzz@C7VF:~$ echo ${PATH}
/opt/ros/noetic/bin:/home/binzz/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games

# 错误，因为待替换文本的匹配模式含预定的分隔符/
binzz@C7VF:~$ echo $PATH | sed 's/:/usr/local/games//g'  <== 错误
sed: -e 表达式 #1, 字符 9: “s”的未知选项↵

# 在上一步的基础上用\转义
binzz@C7VF:~$ echo $PATH | sed 's/:\/usr\/local\/games//g'   <== 转义
/opt/ros/noetic/bin:/home/binzz/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games

# 一个个转义真麻烦。看到了吗？可以将分隔符由/切换为#
binzz@C7VF:~$ echo $PATH | sed 's#:/usr/local/games##g'  <== 切换分隔符
/opt/ros/noetic/bin:/home/binzz/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games
binzz@C7VF:~$

# 尤其是用带/的变量表示匹配模式时，更需要将分隔符切换为#。下面的示例是在提取相对路径。
binzz@C7VF:~$ cd Desktop/test
binzz@C7VF:~/Desktop/test$ pwd | sed "s/${HOME}//g"  <== 错误
sed: -e 表达式 #1, 字符 9: “s”的未知选项↵
binzz@C7VF:~/Desktop/test$ pwd | sed "s#${HOME}##g"  <== 正确
/Desktop/test
binzz@C7VF:~/Desktop/test$ 
```
##### 联想到Shell自身的变量替换操作
想起不用`sed`，用Shell自身的变量替换操作也可以，比如：
```bash
binzz@C7VF:~$ echo ${PATH//:/usr/local/games/} 
/opt/ros/noetic/binusr/local/games//home/binzz/.local/binusr/local/games//usr/local/sbinusr/local/games//usr/local/binusr/local/games//usr/sbinusr/local/games//usr/binusr/local/games//sbinusr/local/games//binusr/local/games//usr/gamesusr/local/games//usr/local/games <== 替换:为一长串，不是我们想要的

binzz@C7VF:~$ echo ${PATH//:\/usr\/local\/games/} <== 转义/，OK的
/opt/ros/noetic/bin:/home/binzz/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games
binzz@C7VF:~/Desktop/test$ echo ${PATH##:/usr/local/games#}

/opt/ros/noetic/bin:/home/binzz/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games <== 换分隔符，无效
binzz@C7VF:~/Desktop/test$ 
```
为什么用Shell自身的变量替换操作不能将分隔符换为#？因为这会被识别为`${<varname>##<pattern>}`，从左侧删掉符合`<pattern>`的最长的内容。

##### 总结
- sed 的替换操作可以更换分隔符（默认 `/`，也可以用 `#` ），但要考虑转义。
- Shell 的变量替换语法不能换分隔符，用的是固定语法结构，不支持 `#` 换 `/`。





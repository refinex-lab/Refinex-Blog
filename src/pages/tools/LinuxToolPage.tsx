import { useEffect, useMemo, useState } from "react";
import { Copy, Search, TerminalSquare } from "lucide-react";

type LinuxCategory =
  | "filesystem"
  | "process"
  | "network"
  | "system"
  | "text"
  | "service";

type LinuxCommandOption = {
  flag: string;
  description: string;
};

type LinuxCommandCase = {
  title: string;
  command: string;
  description: string;
};

type LinuxCommandItem = {
  command: string;
  category: LinuxCategory;
  summary: string;
  syntax: string;
  detail: string;
  options: LinuxCommandOption[];
  cases: LinuxCommandCase[];
  tip: string;
  caution?: string;
  aliases?: string[];
  related?: string[];
};

const CATEGORY_OPTIONS: Array<{ id: "all" | LinuxCategory; label: string }> = [
  { id: "all", label: "全部" },
  { id: "filesystem", label: "文件系统" },
  { id: "process", label: "进程管理" },
  { id: "network", label: "网络诊断" },
  { id: "system", label: "系统信息" },
  { id: "text", label: "文本处理" },
  { id: "service", label: "服务与包管理" },
];

const LINUX_COMMANDS: LinuxCommandItem[] = [
  {
    command: "ls",
    category: "filesystem",
    summary: "列出目录内容并查看权限、大小、时间信息。",
    syntax: "ls [选项] [路径]",
    detail: "默认按名称展示目录项，结合不同选项可用于排查文件权限和最近变更。",
    options: [
      { flag: "-a", description: "包含隐藏文件（以 . 开头）" },
      { flag: "-l", description: "使用长格式显示权限/属主/时间" },
      { flag: "-h", description: "与 -l 配合，大小按 KB/MB/GB 展示" },
      { flag: "-t", description: "按修改时间排序" },
    ],
    cases: [
      {
        title: "排查日志目录",
        command: "ls -alh /var/log",
        description: "查看日志权限、归属和体积。",
      },
      {
        title: "定位最新变更文件",
        command: "ls -lt",
        description: "按修改时间倒序，快速定位最近文件。",
      },
    ],
    tip: "若文件名有空格，可加 -Q 便于复制命令。",
    aliases: ["dir"],
    related: ["find", "stat", "tree"],
  },
  {
    command: "find",
    category: "filesystem",
    summary: "递归查找文件并支持执行批量操作。",
    syntax: "find 路径 [匹配条件] [动作]",
    detail: "可按名称、时间、大小、权限筛选，并可配合 -exec 或 xargs 批处理。",
    options: [
      { flag: "-name", description: "按文件名匹配（支持通配符）" },
      { flag: "-type", description: "按类型过滤，f=文件 d=目录" },
      { flag: "-mtime", description: "按修改时间过滤（天）" },
      { flag: "-size", description: "按大小过滤，如 +100M" },
    ],
    cases: [
      {
        title: "查找 7 天前日志",
        command: "find /var/log -type f -name '*.log' -mtime +7",
        description: "清理历史日志前先筛选目标文件。",
      },
      {
        title: "批量删除临时文件",
        command: "find . -type f -name '*.tmp' -print0 | xargs -0 rm -f",
        description: "对含空格文件名更安全。",
      },
    ],
    tip: "先用 -print 预览结果，再执行删除类动作。",
    caution: "避免直接将 find 结果接 rm -rf，建议先人工确认。",
    related: ["xargs", "rm", "locate"],
  },
  {
    command: "mkdir",
    category: "filesystem",
    summary: "创建目录，支持递归创建多级路径。",
    syntax: "mkdir [选项] 目录名...",
    detail: "常用于项目初始化、备份目录创建、脚本部署前准备。",
    options: [
      { flag: "-p", description: "递归创建，不因已存在目录报错" },
      { flag: "-m", description: "创建时指定权限，如 755" },
      { flag: "-v", description: "显示创建过程" },
    ],
    cases: [
      {
        title: "初始化多级目录",
        command: "mkdir -p /data/app/{logs,backup,tmp}",
        description: "一次创建多层目录结构。",
      },
      {
        title: "创建并指定权限",
        command: "mkdir -m 750 /data/private",
        description: "避免后续再 chmod。",
      },
    ],
    tip: "脚本中推荐始终使用 -p，提升幂等性。",
    related: ["chmod", "chown"],
  },
  {
    command: "cp",
    category: "filesystem",
    summary: "复制文件或目录并保留元信息。",
    syntax: "cp [选项] 源 目标",
    detail: "用于备份、部署静态资源、批量复制配置文件。",
    options: [
      { flag: "-r", description: "递归复制目录" },
      { flag: "-a", description: "归档模式，保留权限/时间/链接" },
      { flag: "-n", description: "不覆盖已存在文件" },
      { flag: "-v", description: "显示复制过程" },
    ],
    cases: [
      {
        title: "完整备份配置目录",
        command: "cp -a /etc/nginx /backup/nginx-$(date +%F)",
        description: "保留权限和时间戳。",
      },
      {
        title: "部署前增量复制",
        command: "cp -rn ./dist/* /srv/www/",
        description: "避免覆盖已有文件。",
      },
    ],
    tip: "涉及系统目录时建议先在测试环境验证复制结果。",
    related: ["mv", "rsync", "tar"],
  },
  {
    command: "mv",
    category: "filesystem",
    summary: "移动或重命名文件/目录。",
    syntax: "mv [选项] 源 目标",
    detail: "同分区通常是元数据变更，效率高于复制删除。",
    options: [
      { flag: "-n", description: "不覆盖目标文件" },
      { flag: "-i", description: "覆盖前提示确认" },
      { flag: "-v", description: "显示移动过程" },
    ],
    cases: [
      {
        title: "日志轮转",
        command: "mv app.log app.log.$(date +%F)",
        description: "按日期重命名日志文件。",
      },
      {
        title: "批量改后缀",
        command: "for f in *.txt; do mv \"$f\" \"${f%.txt}.md\"; done",
        description: "将 txt 文件批量改为 md。",
      },
    ],
    tip: "可配合 -n 降低批处理误覆盖风险。",
    related: ["cp", "rename"],
  },
  {
    command: "rm",
    category: "filesystem",
    summary: "删除文件或目录。",
    syntax: "rm [选项] 文件/目录",
    detail: "删除后通常不可恢复，建议先 dry-run（例如先 ls 再 rm）。",
    options: [
      { flag: "-r", description: "递归删除目录" },
      { flag: "-f", description: "忽略不存在项并不提示" },
      { flag: "-i", description: "每次删除前确认" },
      { flag: "-v", description: "显示删除过程" },
    ],
    cases: [
      {
        title: "删除构建产物",
        command: "rm -rf ./dist",
        description: "前端构建前常见清理动作。",
      },
      {
        title: "清理空文件",
        command: "find . -type f -empty -print0 | xargs -0 rm -v",
        description: "结合 find 定位后删除。",
      },
    ],
    tip: "生产环境建议使用绝对路径，并先执行 echo/ls 预览。",
    caution: "谨慎使用 rm -rf / 或变量拼接路径删除。",
    related: ["find", "trash", "mv"],
  },
  {
    command: "chmod",
    category: "filesystem",
    summary: "修改文件或目录权限。",
    syntax: "chmod [选项] 模式 文件",
    detail: "支持数字模式与符号模式，常用于脚本可执行权限和目录访问控制。",
    options: [
      { flag: "-R", description: "递归处理目录内所有项" },
      { flag: "u/g/o", description: "用户/组/其他用户权限控制" },
      { flag: "+x/-w", description: "符号模式增减权限" },
    ],
    cases: [
      {
        title: "部署脚本授权",
        command: "chmod 755 deploy.sh",
        description: "赋予执行权限且仅所有者可写。",
      },
      {
        title: "限制私钥权限",
        command: "chmod 600 ~/.ssh/id_rsa",
        description: "避免 SSH 私钥权限过宽。",
      },
    ],
    tip: "目录通常至少需要执行位 x 才可进入。",
    related: ["chown", "umask"],
  },
  {
    command: "chown",
    category: "filesystem",
    summary: "修改文件归属用户与组。",
    syntax: "chown [选项] 用户[:组] 文件",
    detail: "常用于服务目录权限修复与部署后归属调整。",
    options: [
      { flag: "-R", description: "递归修改目录" },
      { flag: "--reference", description: "参照某个文件的归属" },
    ],
    cases: [
      {
        title: "修复 Web 根目录归属",
        command: "chown -R nginx:nginx /var/www/html",
        description: "避免服务进程无写入权限。",
      },
      {
        title: "按参照文件同步归属",
        command: "chown --reference=./a.txt ./b.txt",
        description: "快速对齐同类文件归属。",
      },
    ],
    tip: "变更系统目录归属前先确认服务运行账号。",
    related: ["chmod", "id", "groups"],
  },
  {
    command: "tar",
    category: "filesystem",
    summary: "打包与解包归档文件。",
    syntax: "tar [选项] 文件.tar[.gz/.xz] [路径]",
    detail: "Linux 归档与备份核心命令，常与 gzip/xz 联合使用。",
    options: [
      { flag: "-c", description: "创建归档" },
      { flag: "-x", description: "解压归档" },
      { flag: "-t", description: "查看归档内容" },
      { flag: "-z/-J", description: "gzip/xz 压缩格式" },
      { flag: "-f", description: "指定归档文件名" },
    ],
    cases: [
      {
        title: "创建压缩包",
        command: "tar -czf backup-$(date +%F).tar.gz /etc/nginx",
        description: "打包并 gzip 压缩配置目录。",
      },
      {
        title: "解压到指定目录",
        command: "tar -xzf app.tar.gz -C /srv/app",
        description: "部署场景常用。",
      },
    ],
    tip: "先 tar -tf 查看内容，避免误解压覆盖。",
    related: ["gzip", "zip", "cp"],
  },
  {
    command: "ps",
    category: "process",
    summary: "查看进程快照。",
    syntax: "ps [选项]",
    detail: "常用于定位进程 PID、占用资源与启动参数。",
    options: [
      { flag: "aux", description: "显示全部用户进程及详细信息" },
      { flag: "-ef", description: "标准全量格式输出" },
      { flag: "-o", description: "自定义输出字段" },
    ],
    cases: [
      {
        title: "查找 Java 进程",
        command: "ps -ef | grep java",
        description: "确认应用是否启动。",
      },
      {
        title: "按字段输出",
        command: "ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head",
        description: "查看高 CPU 进程。",
      },
    ],
    tip: "grep 时可使用 '[j]ava' 避免匹配到 grep 本身。",
    related: ["top", "pgrep", "kill"],
  },
  {
    command: "top",
    category: "process",
    summary: "实时监控系统负载和进程资源占用。",
    syntax: "top [选项]",
    detail: "交互界面可按 CPU、内存、运行时间排序，适合快速定位热点进程。",
    options: [
      { flag: "-p PID", description: "仅监控指定进程" },
      { flag: "-d 秒", description: "设置刷新间隔" },
      { flag: "-n 次数", description: "批处理模式刷新固定次数后退出" },
    ],
    cases: [
      {
        title: "只看某个进程",
        command: "top -p 1234",
        description: "精确观察目标进程资源变化。",
      },
      {
        title: "脚本采样",
        command: "top -b -n 1 | head -40",
        description: "采集快照用于排障记录。",
      },
    ],
    tip: "交互模式按 P 按 CPU 排序，M 按内存排序。",
    related: ["ps", "htop", "vmstat"],
  },
  {
    command: "pgrep",
    category: "process",
    summary: "按进程名查找 PID。",
    syntax: "pgrep [选项] 模式",
    detail: "比 ps|grep 更简洁，适合脚本中获取 PID。",
    options: [
      { flag: "-f", description: "匹配完整命令行" },
      { flag: "-a", description: "输出 PID + 命令行" },
      { flag: "-u", description: "仅匹配指定用户" },
    ],
    cases: [
      {
        title: "获取 nginx PID",
        command: "pgrep -x nginx",
        description: "用于健康检查和脚本控制。",
      },
      {
        title: "查看匹配进程详情",
        command: "pgrep -af node",
        description: "快速查看 Node 进程启动参数。",
      },
    ],
    tip: "可配合 kill 使用：kill $(pgrep -x nginx)。",
    related: ["pkill", "ps", "kill"],
  },
  {
    command: "kill",
    category: "process",
    summary: "向进程发送信号。",
    syntax: "kill [信号] PID",
    detail: "默认发送 TERM（15），让进程优雅退出；必要时再发送 KILL（9）。",
    options: [
      { flag: "-TERM", description: "请求进程优雅终止" },
      { flag: "-KILL", description: "强制终止进程" },
      { flag: "-HUP", description: "通知进程重载配置" },
    ],
    cases: [
      {
        title: "优雅停止进程",
        command: "kill -TERM 12345",
        description: "优先释放资源、写入退出日志。",
      },
      {
        title: "重载 nginx 配置",
        command: "kill -HUP $(cat /run/nginx.pid)",
        description: "无需完全重启服务。",
      },
    ],
    tip: "先 TERM 再 KILL 是更安全的处理流程。",
    caution: "避免误杀系统关键进程，执行前确认 PID 与命令。",
    related: ["pkill", "pgrep", "systemctl"],
  },
  {
    command: "nohup",
    category: "process",
    summary: "让任务在会话退出后继续运行。",
    syntax: "nohup 命令 > 输出文件 2>&1 &",
    detail: "常用于远程登录下启动长任务，避免终端断开导致进程结束。",
    options: [
      { flag: "&", description: "后台运行" },
      { flag: "> file", description: "重定向标准输出" },
      { flag: "2>&1", description: "合并错误输出" },
    ],
    cases: [
      {
        title: "后台启动 Java 服务",
        command: "nohup java -jar app.jar > app.log 2>&1 &",
        description: "关闭 SSH 后进程仍存活。",
      },
      {
        title: "后台跑脚本",
        command: "nohup bash sync.sh > sync.log 2>&1 &",
        description: "适合长耗时同步任务。",
      },
    ],
    tip: "配合 tail -f 实时查看输出日志。",
    related: ["screen", "tmux", "jobs"],
  },
  {
    command: "ip",
    category: "network",
    summary: "查看与管理网络地址、路由、链路。",
    syntax: "ip [addr|route|link] 子命令",
    detail: "现代 Linux 推荐网络命令，覆盖 ifconfig/route 的能力。",
    options: [
      { flag: "addr show", description: "查看网卡 IP 地址" },
      { flag: "route show", description: "查看路由表" },
      { flag: "link set", description: "控制网卡 up/down" },
    ],
    cases: [
      {
        title: "查看所有地址",
        command: "ip addr show",
        description: "排查网卡与 IP 配置。",
      },
      {
        title: "查看默认路由",
        command: "ip route | grep default",
        description: "检查出口路由是否正常。",
      },
    ],
    tip: "生产环境改链路状态前，建议保留控制台回滚手段。",
    related: ["ss", "ping", "traceroute"],
  },
  {
    command: "ss",
    category: "network",
    summary: "查看 socket 连接与监听端口。",
    syntax: "ss [选项]",
    detail: "排查端口占用、连接爆满、服务监听异常时非常高效。",
    options: [
      { flag: "-l", description: "仅显示监听中的 socket" },
      { flag: "-t/-u", description: "仅显示 TCP / UDP" },
      { flag: "-n", description: "不做域名和服务名解析" },
      { flag: "-p", description: "显示进程信息" },
    ],
    cases: [
      {
        title: "看端口监听者",
        command: "ss -lntp",
        description: "快速定位端口被哪个进程占用。",
      },
      {
        title: "统计连接状态",
        command: "ss -tan | awk '{print $1}' | sort | uniq -c",
        description: "观察 TIME_WAIT 等状态分布。",
      },
    ],
    tip: "排障优先使用 ss，通常比 netstat 更快。",
    related: ["lsof", "netstat", "ip"],
  },
  {
    command: "ping",
    category: "network",
    summary: "探测目标可达性与往返时延。",
    syntax: "ping [选项] 目标",
    detail: "用于基础网络连通性验证，不代表应用端口一定可用。",
    options: [
      { flag: "-c 次数", description: "发送固定次数后退出" },
      { flag: "-i 间隔", description: "设置发送间隔秒数" },
      { flag: "-W 超时", description: "每个请求等待超时" },
    ],
    cases: [
      {
        title: "快速连通性检查",
        command: "ping -c 4 8.8.8.8",
        description: "观察丢包率和平均时延。",
      },
      {
        title: "低频持续检测",
        command: "ping -i 2 api.example.com",
        description: "观察网络抖动趋势。",
      },
    ],
    tip: "若 ICMP 被禁，建议改用 curl/nc 验证业务端口。",
    related: ["traceroute", "curl", "nc"],
  },
  {
    command: "curl",
    category: "network",
    summary: "发起 HTTP/HTTPS 请求并调试接口。",
    syntax: "curl [选项] URL",
    detail: "支持方法、Header、认证、超时、重试等，API 调试高频命令。",
    options: [
      { flag: "-X", description: "指定请求方法" },
      { flag: "-H", description: "添加请求头" },
      { flag: "-d", description: "发送请求体数据" },
      { flag: "-I", description: "仅获取响应头" },
      { flag: "-v", description: "显示请求调试细节" },
    ],
    cases: [
      {
        title: "带 token 调接口",
        command:
          "curl -X GET 'https://api.example.com/user' -H 'Authorization: Bearer <token>'",
        description: "验证鉴权与响应内容。",
      },
      {
        title: "POST JSON",
        command:
          "curl -X POST 'https://api.example.com/order' -H 'Content-Type: application/json' -d '{\"id\":1}'",
        description: "模拟前端提交请求。",
      },
    ],
    tip: "建议配合 -sS 与 --fail 在脚本里更易处理错误。",
    related: ["wget", "httpie", "jq"],
  },
  {
    command: "wget",
    category: "network",
    summary: "下载文件并支持断点续传。",
    syntax: "wget [选项] URL",
    detail: "适合在服务器批量拉取安装包、模型文件、归档资源。",
    options: [
      { flag: "-O", description: "自定义保存文件名" },
      { flag: "-c", description: "断点续传" },
      { flag: "--limit-rate", description: "限制下载速率" },
      { flag: "-q", description: "静默模式" },
    ],
    cases: [
      {
        title: "下载并重命名",
        command: "wget -O app.tar.gz https://example.com/download/app.tar.gz",
        description: "规范产物命名。",
      },
      {
        title: "大文件断点续传",
        command: "wget -c https://example.com/big-file.iso",
        description: "断线后可继续下载。",
      },
    ],
    tip: "脚本下载推荐加 --tries 与超时控制。",
    related: ["curl", "aria2c"],
  },
  {
    command: "traceroute",
    category: "network",
    summary: "跟踪到目标主机的路由跳点。",
    syntax: "traceroute [选项] 目标",
    detail: "用于定位网络链路中延迟或丢包异常节点。",
    options: [
      { flag: "-n", description: "仅显示 IP，不做 DNS 解析" },
      { flag: "-I", description: "使用 ICMP 探测" },
      { flag: "-m", description: "最大跳数" },
    ],
    cases: [
      {
        title: "排查跨网段延迟",
        command: "traceroute -n api.example.com",
        description: "确认延迟集中在哪一跳。",
      },
      {
        title: "限制跳数测试",
        command: "traceroute -m 15 8.8.8.8",
        description: "加速排查近端路径。",
      },
    ],
    tip: "部分网络会限制探测报文，结果可能不完整。",
    related: ["ping", "mtr", "ip"],
  },
  {
    command: "uname",
    category: "system",
    summary: "查看内核与系统架构信息。",
    syntax: "uname [选项]",
    detail: "用于确认运行平台、内核版本、CPU 架构。",
    options: [
      { flag: "-a", description: "显示全部核心信息" },
      { flag: "-r", description: "仅显示内核版本" },
      { flag: "-m", description: "显示机器硬件架构" },
    ],
    cases: [
      {
        title: "确认部署架构",
        command: "uname -m",
        description: "区分 x86_64 与 arm64 包。",
      },
      {
        title: "系统信息快照",
        command: "uname -a",
        description: "排障报告常用。",
      },
    ],
    tip: "容器内结果可能受宿主内核影响。",
    related: ["cat /etc/os-release", "lscpu"],
  },
  {
    command: "free",
    category: "system",
    summary: "查看内存使用统计。",
    syntax: "free [选项]",
    detail: "重点关注 available 而非 free，评估系统是否存在内存压力。",
    options: [
      { flag: "-h", description: "人类可读单位展示" },
      { flag: "-m/-g", description: "按 MB / GB 固定单位显示" },
      { flag: "-s 秒", description: "按间隔持续刷新" },
    ],
    cases: [
      {
        title: "快速查看内存",
        command: "free -h",
        description: "日常巡检常用。",
      },
      {
        title: "持续观测",
        command: "free -h -s 2",
        description: "定位内存持续上升问题。",
      },
    ],
    tip: "结合 vmstat/top 可定位是缓存占用还是进程泄漏。",
    related: ["vmstat", "top", "ps"],
  },
  {
    command: "df",
    category: "system",
    summary: "查看文件系统磁盘使用率。",
    syntax: "df [选项] [路径]",
    detail: "线上故障排查中常用于确认磁盘是否打满。",
    options: [
      { flag: "-h", description: "人类可读单位" },
      { flag: "-T", description: "显示文件系统类型" },
      { flag: "-i", description: "显示 inode 使用情况" },
    ],
    cases: [
      {
        title: "巡检全部分区",
        command: "df -h",
        description: "快速发现高占用挂载点。",
      },
      {
        title: "检查 inode 是否耗尽",
        command: "df -i",
        description: "小文件过多时重点关注。",
      },
    ],
    tip: "磁盘空间与 inode 任一耗尽都会影响写入。",
    related: ["du", "lsblk", "mount"],
  },
  {
    command: "du",
    category: "system",
    summary: "统计目录和文件实际占用空间。",
    syntax: "du [选项] [路径]",
    detail: "用于定位占用磁盘的大目录或大文件。",
    options: [
      { flag: "-h", description: "人类可读单位" },
      { flag: "-s", description: "仅汇总总量" },
      { flag: "--max-depth", description: "限制目录递归深度" },
    ],
    cases: [
      {
        title: "找出大目录",
        command: "du -h --max-depth=1 /var | sort -hr | head",
        description: "快速定位磁盘热点目录。",
      },
      {
        title: "查看单目录总量",
        command: "du -sh /var/log",
        description: "评估日志清理收益。",
      },
    ],
    tip: "先大目录再细分，分层排查效率更高。",
    related: ["df", "find"],
  },
  {
    command: "vmstat",
    category: "system",
    summary: "观察系统 CPU、内存、IO、上下文切换状态。",
    syntax: "vmstat [选项] [间隔] [次数]",
    detail: "适合初步判断瓶颈在 CPU、内存还是 IO。",
    options: [
      { flag: "1 5", description: "每秒采样 5 次" },
      { flag: "-s", description: "显示内存统计汇总" },
      { flag: "-d", description: "显示磁盘统计" },
    ],
    cases: [
      {
        title: "瞬时性能采样",
        command: "vmstat 1 5",
        description: "定位短时突刺问题。",
      },
      {
        title: "查看 swap 压力",
        command: "vmstat -s | grep -i swap",
        description: "判断是否频繁交换。",
      },
    ],
    tip: "重点关注 r、wa、si/so 等指标组合。",
    related: ["top", "iostat", "free"],
  },
  {
    command: "dmesg",
    category: "system",
    summary: "查看内核日志缓冲区。",
    syntax: "dmesg [选项]",
    detail: "硬件故障、驱动异常、OOM 等问题常在内核日志中体现。",
    options: [
      { flag: "-T", description: "以可读时间显示" },
      { flag: "-l", description: "按级别过滤" },
      { flag: "-w", description: "实时跟踪新日志" },
    ],
    cases: [
      {
        title: "排查 OOM",
        command: "dmesg -T | grep -i 'killed process'",
        description: "查看是否被内核杀进程。",
      },
      {
        title: "跟踪设备异常",
        command: "dmesg -Tw",
        description: "实时观察内核事件。",
      },
    ],
    tip: "某些系统需 root 权限才能查看完整内容。",
    related: ["journalctl", "free", "top"],
  },
  {
    command: "grep",
    category: "text",
    summary: "文本搜索核心命令。",
    syntax: "grep [选项] 模式 文件/目录",
    detail: "支持正则、递归、行号、高亮，日志排障高频使用。",
    options: [
      { flag: "-R", description: "递归搜索目录" },
      { flag: "-n", description: "显示匹配行号" },
      { flag: "-i", description: "忽略大小写" },
      { flag: "-E", description: "启用扩展正则" },
      { flag: "-v", description: "反向匹配（不包含模式）" },
    ],
    cases: [
      {
        title: "定位错误日志",
        command: "grep -Rin 'error|fatal' ./logs",
        description: "快速查找故障关键字。",
      },
      {
        title: "过滤注释行",
        command: "grep -Ev '^\s*#|^\s*$' config.ini",
        description: "去掉注释和空行查看有效配置。",
      },
    ],
    tip: "超大文件可先配合 head/tail 缩小范围。",
    related: ["awk", "sed", "rg"],
  },
  {
    command: "sed",
    category: "text",
    summary: "流式编辑文本，适合批量替换。",
    syntax: "sed [选项] '脚本' 文件",
    detail: "支持正则替换、行选取、插入删除；脚本自动化中非常实用。",
    options: [
      { flag: "-n", description: "静默模式，仅打印匹配结果" },
      { flag: "-i", description: "原地修改文件（macOS 需带备份后缀）" },
      { flag: "s/old/new/g", description: "全局替换" },
      { flag: "p", description: "打印匹配行" },
    ],
    cases: [
      {
        title: "替换配置中的域名",
        command: "sed -i '' 's/old.example.com/new.example.com/g' .env",
        description: "macOS 原地替换示例。",
      },
      {
        title: "提取区间行",
        command: "sed -n '20,40p' app.log",
        description: "查看指定行区间内容。",
      },
    ],
    tip: "GNU sed 与 BSD sed 参数有差异，脚本应区分系统。",
    related: ["awk", "perl", "grep"],
  },
  {
    command: "awk",
    category: "text",
    summary: "按字段处理文本，适合日志/CSV 分析。",
    syntax: "awk [选项] '程序' 文件",
    detail: "可做筛选、聚合、格式化输出，轻量替代临时脚本。",
    options: [
      { flag: "-F 分隔符", description: "指定字段分隔符" },
      { flag: "NR", description: "当前行号变量" },
      { flag: "$1,$2", description: "按列访问字段" },
      { flag: "BEGIN/END", description: "前后置初始化与汇总逻辑" },
    ],
    cases: [
      {
        title: "统计接口状态码分布",
        command: "awk '{count[$9]++} END {for (c in count) print c, count[c]}' access.log",
        description: "Nginx 日志按状态码聚合。",
      },
      {
        title: "提取 CSV 指定列",
        command: "awk -F, '{print $1,$3}' users.csv",
        description: "输出第 1 和第 3 列。",
      },
    ],
    tip: "复杂逻辑可先写成 awk 脚本文件再执行。",
    related: ["grep", "sed", "cut", "sort"],
  },
  {
    command: "sort",
    category: "text",
    summary: "对文本行排序。",
    syntax: "sort [选项] 文件",
    detail: "可按字典序、数值、字段进行升降序排序。",
    options: [
      { flag: "-n", description: "按数值排序" },
      { flag: "-r", description: "倒序" },
      { flag: "-k", description: "按第 N 列排序" },
      { flag: "-u", description: "排序并去重" },
    ],
    cases: [
      {
        title: "按 CPU 倒序",
        command: "ps -eo pid,%cpu,cmd --sort=-%cpu | head",
        description: "结合 ps 可快速定位热点。",
      },
      {
        title: "按第二列数值排序",
        command: "sort -k2,2n data.txt",
        description: "结构化文本常见需求。",
      },
    ],
    tip: "大文件排序可设置临时目录提高性能：sort -T /tmp。",
    related: ["uniq", "awk", "cut"],
  },
  {
    command: "uniq",
    category: "text",
    summary: "去重或统计相邻重复行。",
    syntax: "uniq [选项] [文件]",
    detail: "需先排序再 uniq 才能完成全局去重统计。",
    options: [
      { flag: "-c", description: "统计重复次数" },
      { flag: "-d", description: "仅输出重复行" },
      { flag: "-u", description: "仅输出不重复行" },
    ],
    cases: [
      {
        title: "IP 访问次数统计",
        command: "awk '{print $1}' access.log | sort | uniq -c | sort -nr | head",
        description: "查看高频访问来源。",
      },
      {
        title: "提取重复配置项",
        command: "sort config.txt | uniq -d",
        description: "检查重复配置键。",
      },
    ],
    tip: "uniq 只处理相邻重复，请记得先 sort。",
    related: ["sort", "awk"],
  },
  {
    command: "tail",
    category: "text",
    summary: "查看文件末尾内容并支持实时追踪。",
    syntax: "tail [选项] 文件",
    detail: "线上实时观察日志最常用命令之一。",
    options: [
      { flag: "-n", description: "显示最后 N 行" },
      { flag: "-f", description: "实时跟踪新增内容" },
      { flag: "-F", description: "文件重建/轮转后继续跟踪" },
    ],
    cases: [
      {
        title: "实时观察错误日志",
        command: "tail -F /var/log/nginx/error.log",
        description: "日志轮转后也能持续跟踪。",
      },
      {
        title: "只看最近 200 行",
        command: "tail -n 200 app.log",
        description: "快速回看近几分钟事件。",
      },
    ],
    tip: "排障时可与 grep 联用：tail -f app.log | grep ERROR。",
    related: ["head", "less", "grep"],
  },
  {
    command: "systemctl",
    category: "service",
    summary: "管理 systemd 服务与启动项。",
    syntax: "systemctl [命令] [服务名]",
    detail: "现代 Linux 服务管理核心命令，用于启停、重载、状态检查。",
    options: [
      { flag: "status", description: "查看服务状态和最近日志" },
      { flag: "start/stop/restart", description: "启停或重启服务" },
      { flag: "reload", description: "重载配置不重启进程（服务支持时）" },
      { flag: "enable/disable", description: "设置开机自启" },
    ],
    cases: [
      {
        title: "重启 nginx",
        command: "sudo systemctl restart nginx",
        description: "配置变更后快速生效。",
      },
      {
        title: "检查失败服务",
        command: "systemctl --failed",
        description: "巡检异常服务。",
      },
    ],
    tip: "重载优先于重启，可减少业务中断。",
    related: ["journalctl", "service", "kill"],
  },
  {
    command: "journalctl",
    category: "service",
    summary: "查询 systemd 日志。",
    syntax: "journalctl [选项]",
    detail: "可按服务、时间范围、优先级筛选日志，适合服务级排障。",
    options: [
      { flag: "-u 服务", description: "仅查看指定服务日志" },
      { flag: "-f", description: "实时跟踪日志" },
      { flag: "-n 数量", description: "显示最近 N 条" },
      { flag: "--since/--until", description: "按时间范围过滤" },
    ],
    cases: [
      {
        title: "跟踪 nginx 实时日志",
        command: "journalctl -u nginx -f",
        description: "观察重启后实时行为。",
      },
      {
        title: "查看最近 1 小时错误",
        command: "journalctl -u app --since '1 hour ago' -p err",
        description: "聚焦故障日志。",
      },
    ],
    tip: "结合 systemctl status 可快速定位失败原因。",
    related: ["systemctl", "dmesg", "tail"],
  },
  {
    command: "apt",
    category: "service",
    summary: "Debian/Ubuntu 系包管理命令。",
    syntax: "apt [子命令] [包名]",
    detail: "用于安装、升级、卸载软件包以及刷新仓库索引。",
    options: [
      { flag: "update", description: "刷新包索引" },
      { flag: "install", description: "安装软件包" },
      { flag: "remove/purge", description: "卸载包（purge 含配置）" },
      { flag: "list --upgradable", description: "查看可升级包" },
    ],
    cases: [
      {
        title: "安装常用工具",
        command: "sudo apt update && sudo apt install -y curl jq",
        description: "部署脚本常见初始化步骤。",
      },
      {
        title: "清理无用依赖",
        command: "sudo apt autoremove -y",
        description: "减少系统冗余包。",
      },
    ],
    tip: "线上变更建议固定包版本，避免不可控升级。",
    caution: "生产环境批量升级前先在预发环境验证。",
    related: ["dpkg", "yum", "dnf"],
  },
];

const categoryLabelMap: Record<LinuxCategory, string> = {
  filesystem: "文件系统",
  process: "进程管理",
  network: "网络诊断",
  system: "系统信息",
  text: "文本处理",
  service: "服务与包管理",
};

export const LinuxToolPage = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | LinuxCategory>(
    "all"
  );
  const [selectedCommand, setSelectedCommand] =
    useState<LinuxCommandItem>(LINUX_COMMANDS[0]);
  const [copied, setCopied] = useState<string | null>(null);

  const list = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return LINUX_COMMANDS.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      if (!normalized) return true;
      const haystack = [
        item.command,
        item.summary,
        item.syntax,
        item.detail,
        item.tip,
        item.caution ?? "",
        ...(item.aliases ?? []),
        ...(item.related ?? []),
        ...item.options.flatMap((option) => [option.flag, option.description]),
        ...item.cases.flatMap((scenario) => [
          scenario.title,
          scenario.command,
          scenario.description,
        ]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [activeCategory, query]);

  useEffect(() => {
    if (!list.length) return;
    if (!list.some((item) => item.command === selectedCommand.command)) {
      setSelectedCommand(list[0]);
    }
  }, [list, selectedCommand.command]);

  const handleCopy = async (value: string, flag: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(flag);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-black/5 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100">
            <TerminalSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Linux 命令查询
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              覆盖文件、进程、网络、系统、文本与服务管理，支持参数和案例检索。
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索命令、参数、案例、风险提示或相关关键词"
              className="h-11 w-full rounded-xl border border-black/10 bg-white/85 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {CATEGORY_OPTIONS.map((option) => {
              const active = option.id === activeCategory;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveCategory(option.id)}
                  className={`rounded-full border px-3 py-1 transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                      : "border-black/10 bg-white/80 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-black/5 bg-white/85 p-3 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              命令列表
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-300">
              {list.length} 条
            </span>
          </div>
          <div className="tool-scrollbar max-h-[70vh] space-y-2 overflow-auto pr-1">
            {list.map((item) => {
              const active = item.command === selectedCommand.command;
              return (
                <button
                  key={item.command}
                  type="button"
                  onClick={() => setSelectedCommand(item)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                      : "border-black/10 bg-white/90 hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm font-semibold">
                      {item.command}
                    </span>
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      {categoryLabelMap[item.category]}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-xs ${
                      active
                        ? "text-white/80 dark:text-slate-300"
                        : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    {item.summary}
                  </p>
                </button>
              );
            })}
            {!list.length ? (
              <div className="rounded-xl border border-dashed border-black/10 p-5 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
                未找到匹配命令，请尝试其他关键词或分类。
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-mono text-2xl font-semibold text-slate-900 dark:text-white">
                {selectedCommand.command}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                {selectedCommand.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(selectedCommand.syntax, "syntax")}
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/80 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            >
              <Copy className="h-4 w-4" />
              复制语法
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                语法
              </h3>
              <p className="mt-2 rounded-lg bg-black/5 px-3 py-2 font-mono text-sm text-slate-800 dark:bg-white/10 dark:text-slate-100">
                {selectedCommand.syntax}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">
                {selectedCommand.detail}
              </p>
            </div>

            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                可选参数
              </h3>
              <div className="mt-2 space-y-2">
                {selectedCommand.options.map((option) => (
                  <div
                    key={`${selectedCommand.command}-${option.flag}`}
                    className="flex items-start gap-2 rounded-lg bg-black/5 px-3 py-2 dark:bg-white/10"
                  >
                    <span className="min-w-[72px] font-mono text-xs text-slate-800 dark:text-slate-100">
                      {option.flag}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-200">
                      {option.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                常用案例
              </h3>
              <div className="mt-2 space-y-3">
                {selectedCommand.cases.map((scenario) => (
                  <div
                    key={`${selectedCommand.command}-${scenario.title}`}
                    className="rounded-lg bg-black/5 p-3 dark:bg-white/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {scenario.title}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(scenario.command, `case-${scenario.title}`)
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white/80 px-2 py-1 text-xs text-slate-600 transition hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        复制
                      </button>
                    </div>
                    <p className="mt-2 rounded-md bg-white/80 px-2 py-1 font-mono text-xs text-slate-800 dark:bg-slate-950/70 dark:text-slate-100">
                      {scenario.command}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">
                      {scenario.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                实践提示
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">
                {selectedCommand.tip}
              </p>
              {selectedCommand.caution ? (
                <p className="mt-2 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  风险提醒：{selectedCommand.caution}
                </p>
              ) : null}
            </div>

            {selectedCommand.related?.length ? (
              <div className="rounded-xl border border-black/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/60">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  相关命令
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCommand.related.map((item) => (
                    <span
                      key={`${selectedCommand.command}-related-${item}`}
                      className="rounded-full border border-black/10 bg-white/80 px-2 py-1 font-mono text-xs text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {copied ? (
            <div className="mt-4 inline-flex rounded-full border border-emerald-300/50 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {copied === "syntax" ? "已复制当前命令语法" : "已复制案例命令"}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

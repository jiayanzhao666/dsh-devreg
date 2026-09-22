# dsh-devreg

让 DeepSeek Harness 直接查看本机开发服务。

[English](README.md) · [GitHub](https://github.com/jiayanzhao666/dsh-devreg)

`dsh-devreg` 是一个独立、只读的 DeepSeek Harness 插件。它展示 `~/.dev-registry/projects/*.json` 中记录的服务、端口、状态和环境 URL。不要求另外安装 CLI，也不会修改注册表。

## 功能

- 在 Harness 会话中查看已登记的开发服务。
- 查找多个服务同时声明同一端口的情况。
- 检查注册表文件是否可以读取。
- 通过 `devreg` 命令行入口读取相同的数据。

## 快速开始

克隆并构建项目：

```sh
git clone https://github.com/jiayanzhao666/dsh-devreg.git
cd dsh-devreg
npm install
npm run build
```

把本地 checkout 加入 Harness profile：

```sh
dsh plugin --profile devreg add link:/absolute/path/to/dsh-devreg
```

之后可以这样移除：

```sh
dsh plugin --profile devreg remove dsh-devreg
```

profile 会获得以下工具：

| 工具 | 作用 | 输入 |
| --- | --- | --- |
| `devreg_status` | 列出已登记的服务。 | 可选的 `project` 筛选条件。 |
| `devreg_conflicts` | 查找重复的端口声明。 | 无。 |
| `devreg_doctor` | 检查注册表文件是否可以读取。 | 无。 |

## 命令行

通过 npm 运行本地 CLI：

```sh
npm run devreg -- ports
npm run devreg -- conflicts
npm run devreg -- doctor
npm run devreg -- export
```

CLI 同样是只读的。如果没有项目文件，列表命令会返回空结果。

## 数据来源

插件读取以下目录中的项目文件：

```text
~/.dev-registry/projects/*.json
```

在字段存在时，它会读取服务名、端口、状态、命令、容器信息、项目路径和环境 URL。它不会启动其他进程、同步 Docker 状态、运行 `devreg serve`，也不会写入 `index.json`。

## 开发

```sh
npm install
npm run typecheck
npm test
npm run build
```

要求 Node.js 22 或更高版本。

## 许可证

MIT

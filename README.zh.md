---
description: "为 DeepSeek Harness profile 提供只读的 devreg 检查工具。"
kind: "package-bundle"
---

# dsh-devreg

[English](README.md) | 中文

## 摘要

为 DeepSeek Harness profile 增加只读的 devreg 检查能力。这个组合包通过模型可见工具展示已登记服务、端口冲突和注册表健康状态。它读取现有的 `~/.dev-registry/projects/*.json` 文件，不修改注册表。

## 目录

- [使用这个包](#使用这个包)
- [实现方式](#实现方式)
- [进一步了解](#进一步了解)
- [模型体验](#模型体验)
- [已知限制和后续工作](#已知限制和后续工作)

-----

<a id="使用这个包"></a>
## 使用这个包

### 安装到 profile

在本地 checkout 中执行：

```sh
npm install
npm run build
dsh plugin --profile devreg add link:/absolute/path/to/dsh-devreg
```

移除：

```sh
dsh plugin --profile devreg remove dsh-devreg
```

这个包声明了 `cordis.patch.yml`，因此 `dsh plugin` 会把它的组合层激活到 profile 中。安装后重启 profile。

### 提供的能力

- `devreg_status` 列出已登记服务，可按项目筛选。
- `devreg_conflicts` 列出声明了同一端口的服务。
- `devreg_doctor` 检查注册表项目文件是否可以读取。

命令行入口还提供 `ports`、`show`、`conflicts`、`doctor` 和 JSON `export` 命令。

-----

<a id="实现方式"></a>
## 实现方式

<details>
<summary>实现细节——点击展开</summary>

`cordis.patch.yml` 将这个包插入 profile。`src/plugin.ts` 通过 `ctx.tools` 注册三个工具。`src/core/registry.ts` 读取并规范化 `~/.dev-registry/projects/*.json`；它不会启动 Python 版 `devreg`，不会获取其文件锁，也不会写入 `index.json`。

</details>

-----

<a id="进一步了解"></a>
## 进一步了解

- [DeepSeek Harness 插件文档](https://github.com/deepseek-harness/deepseek-harness/tree/main/docs/user/develop/basic)
- [源代码仓库](https://github.com/jiayanzhao666/dsh-devreg)

-----

<a id="模型体验"></a>
## 模型体验

模型可以检查本地开发服务，但不能通过这些工具修改注册表。工具返回 JSON，其中会在字段存在时包含项目名、服务名、端口、状态、路径、容器信息和环境 URL。

<a id="已知限制和后续工作"></a>
## 已知限制和后续工作

- 当前版本只读。
- 当前版本读取项目文件，但不会同步 Docker 状态，也不会运行 `devreg serve`。
- 当前版本依赖 `~/.dev-registry/projects` 下已有的 devreg 项目文件格式。

### 开发备注

当前版本没有延期实现项。

## 许可证

MIT

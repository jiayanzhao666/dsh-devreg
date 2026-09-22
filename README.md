# dsh-devreg

Read your local development services from DeepSeek Harness.

[中文说明](README.zh.md) · [GitHub](https://github.com/jiayanzhao666/dsh-devreg)

`dsh-devreg` is a standalone, read-only DeepSeek Harness plugin package. It shows the services, ports, statuses, and environment URLs recorded in `~/.dev-registry/projects/*.json`. It does not require a separate CLI installation and never changes the registry.

## Features

- Inspect registered services from a Harness session.
- Find multiple services claiming the same port.
- Check whether the registry files are readable.
- Use the same data from the `devreg` command-line entry point.

## Quick start

Clone and build the project:

```sh
git clone https://github.com/jiayanzhao666/dsh-devreg.git
cd dsh-devreg
npm install
npm run build
```

Add the checkout to a Harness profile:

```sh
dsh plugin --profile devreg add link:/absolute/path/to/dsh-devreg
```

Remove it later with:

```sh
dsh plugin --profile devreg remove dsh-devreg
```

The profile gets these tools:

| Tool | What it does | Input |
| --- | --- | --- |
| `devreg_status` | Lists registered services. | Optional `project` filter. |
| `devreg_conflicts` | Finds duplicate port claims. | None. |
| `devreg_doctor` | Checks that registry files can be read. | None. |

## CLI

Run the local CLI through npm:

```sh
npm run devreg -- ports
npm run devreg -- conflicts
npm run devreg -- doctor
npm run devreg -- export
```

The CLI is read-only as well. If no project files exist, list commands return an empty result.

## Data source

The plugin reads project files under:

```text
~/.dev-registry/projects/*.json
```

It reads service names, ports, status, commands, container metadata, project paths, and configured environment URLs when those fields exist. It does not start another process, synchronize Docker state, run `devreg serve`, or write `index.json`.

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
```

Node.js 22 or newer is required.

## License

MIT

# dsh-devreg

Local development service registry for developers and coding agents.

The first release provides a small registry reader, a `devreg` CLI, and a read-only DeepSeek Harness plugin. It reads the existing `~/.dev-registry/projects/*.json` files and exposes projects, services, ports, commands, containers, images, Compose files, status, and environment URLs without modifying them.

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
```

## CLI

```sh
npm run devreg -- ports
npm run devreg -- conflicts
npm run devreg -- doctor
npm run devreg -- export --format json
```

## DeepSeek Harness

Install the bundle into a profile and restart the profile:

```sh
dsh plugin --profile web add link:/absolute/path/to/dsh-devreg
```

The plugin currently exposes read-only tools. It never edits registry files directly; write operations will use the same core API after their approval policy is implemented.

## License

MIT

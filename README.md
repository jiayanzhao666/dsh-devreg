---
description: "Adds read-only devreg inspection tools to a DeepSeek Harness profile."
kind: "package-bundle"
---

# dsh-devreg

English | [中文](README.zh.md)

## Summary

Add read-only devreg inspection to a DeepSeek Harness profile. The bundle exposes registered services, port conflicts, and registry health through model-visible tools. It reads the existing `~/.dev-registry/projects/*.json` files and never modifies them.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## Use this package

### Install into a profile

From a local checkout:

```sh
npm install
npm run build
dsh plugin --profile devreg add link:/absolute/path/to/dsh-devreg
```

Remove it with:

```sh
dsh plugin --profile devreg remove dsh-devreg
```

The package declares `cordis.patch.yml`, so `dsh plugin` activates its bundle layer in the profile. Restart the profile after installation.

### What you get

- `devreg_status` lists registered services and accepts an optional project filter.
- `devreg_conflicts` lists services that claim the same port.
- `devreg_doctor` checks that the registry project files can be read.

The command-line entry point also provides `ports`, `show`, `conflicts`, `doctor`, and JSON `export` commands.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

`cordis.patch.yml` inserts the package into the profile. `src/plugin.ts` registers the three tools through `ctx.tools`. `src/core/registry.ts` reads and normalizes `~/.dev-registry/projects/*.json`; it does not invoke the Python `devreg` process, acquire its locks, or write `index.json`.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [DeepSeek Harness plugin documentation](https://github.com/deepseek-harness/deepseek-harness/tree/main/docs/user/develop/basic)
- [Source repository](https://github.com/jiayanzhao666/dsh-devreg)

-----

<a id="model-experience"></a>
## Model Experience

The model can inspect local development services without changing registry state. Tool results are JSON values that include project and service names, ports, status, paths, container metadata, and configured environment URLs when those fields exist.

<a id="known-limitations-and-deferred-work"></a>
## Known Limitations and Deferred Work

- The current release is read-only.
- It reads project files but does not synchronize Docker state or run `devreg serve`.
- It depends on the existing devreg project-file format under `~/.dev-registry/projects`.

### Dev Note

No deferred implementation is part of the current release.

## License

MIT

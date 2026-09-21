#!/usr/bin/env node

import { findConflicts, listServices, readRegistry } from './core/index.js'

const [command, ...args] = process.argv.slice(2)
const project = readOption(args, '--project')

switch (command) {
  case 'ports':
  case 'show':
    printJson(await listServices(command === 'show' ? args[0] : project))
    break
  case 'conflicts':
    printJson(await findConflicts())
    break
  case 'doctor':
    await readRegistry()
    printJson({ ok: true })
    break
  case 'export':
    printJson(await readRegistry())
    break
  default:
    console.error('usage: devreg <ports|show|conflicts|doctor|export> [--project <name>]')
    process.exitCode = 2
}

function readOption(values: readonly string[], name: string): string | undefined {
  const index = values.indexOf(name)
  return index >= 0 ? values[index + 1] : undefined
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

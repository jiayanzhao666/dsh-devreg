import { deepEqual, equal } from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { test } from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { apply, inject, name } from '../src/plugin.js'

test('mounts into Cordis ToolRuntime and executes devreg_status', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-devreg-plugin-'))
  await mkdir(join(root, 'projects'))
  await writeFile(join(root, 'projects', 'demo.json'), JSON.stringify({
    project: { name: 'demo' },
    services: [{ name: 'api', port: 4312, status: 'running' }],
  }))

  const previousRoot = process.env.DEVREG_ROOT
  process.env.DEVREG_ROOT = root
  const ctx = new Context()
  try {
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin({ name, inject, apply })

    deepEqual(ctx.tools.schemas().map(tool => tool.name), [
      'devreg_status',
      'devreg_conflicts',
      'devreg_doctor',
    ])
    const result = await ctx.tools.execute({
      callId: ToolCallId('plugin-smoke'),
      name: 'devreg_status',
      arguments: {},
      signal: new AbortController().signal,
    })
    equal(result.isError, false)
    deepEqual(result.value, [{ project: 'demo', service: 'api', port: 4312, status: 'running' }])
  } finally {
    await ctx.fiber.dispose()
    if (previousRoot === undefined) delete process.env.DEVREG_ROOT
    else process.env.DEVREG_ROOT = previousRoot
  }
})

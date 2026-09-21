import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { findConflicts, listServices, readRegistry } from './core/index.js'

export const name = 'dsh-devreg'
export const inject = ['tools']

/** Mount read-only devreg inspection tools into a DeepSeek Harness profile. */
export function apply(ctx: Context): void {
  ctx.tools.register(defineTool({
    name: 'devreg_status',
    description: 'List locally registered development services, optionally filtered by project.',
    parameters: {
      project: { type: 'string', description: 'Optional registered project name.' },
    },
    output: {
      schema: {
        type: 'array',
        items: { type: 'object', additionalProperties: true, properties: {} },
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    },
    async execute(args) {
      const project = isRecord(args) && typeof args.project === 'string' ? args.project : undefined
      return (await listServices(project)).map(service => ({ ...service }))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'devreg_conflicts',
    description: 'List registered services that claim the same port.',
    parameters: {},
    output: {
      schema: {
        type: 'array',
        items: { type: 'array', items: { type: 'object', additionalProperties: true, properties: {} } },
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    },
    async execute() {
      return (await findConflicts()).map(group => group.map(service => ({ ...service })))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'devreg_doctor',
    description: 'Validate that the local devreg registry can be read.',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: { ok: { type: 'boolean', required: true }, services: { type: 'number', required: true } },
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    async execute() {
      const registry = await readRegistry()
      return { ok: true, services: registry.services.length }
    },
  }))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

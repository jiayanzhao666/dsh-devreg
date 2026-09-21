import { deepEqual } from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { findConflicts, listServices } from '../src/core/index.js'

test('reads services and detects registered port conflicts', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-devreg-'))
  const projects = join(root, 'projects')
  await import('node:fs/promises').then(({ mkdir }) => mkdir(projects))
  await writeFile(join(projects, 'alpha.json'), JSON.stringify({
    project: { name: 'alpha', path: '/tmp/alpha' },
    services: [
      { name: 'api', port: 3000, status: 'running', docker: { image: 'alpha/api:dev' } },
      { name: 'worker' },
    ],
  }))
  await writeFile(join(projects, 'beta.json'), JSON.stringify({
    project: { name: 'beta' },
    services: [{ name: 'api', port: 3000 }],
  }))

  deepEqual(await listServices('alpha', root), [
    { project: 'alpha', service: 'api', port: 3000, status: 'running', image: 'alpha/api:dev', path: '/tmp/alpha' },
    { project: 'alpha', service: 'worker', path: '/tmp/alpha' },
  ])
  deepEqual(await findConflicts(root), [[
    { project: 'alpha', service: 'api', port: 3000, status: 'running', image: 'alpha/api:dev', path: '/tmp/alpha' },
    { project: 'beta', service: 'api', port: 3000 },
  ]])
})

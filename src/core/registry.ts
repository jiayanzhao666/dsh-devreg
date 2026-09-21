import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import type { RegistryDocument, ServiceRecord } from './types.js'

/** Resolve the registry root from the explicit environment override or the user home. */
export function registryRoot(env: NodeJS.ProcessEnv = process.env): string {
  return env.DEVREG_ROOT?.trim() || join(homedir(), '.dev-registry')
}

/** Read the project files used by the devreg CLI, treating a missing registry as empty. */
export async function readRegistry(root = registryRoot()): Promise<RegistryDocument> {
  const projects = join(root, 'projects')
  let names: string[]
  try {
    names = (await readdir(projects)).filter(name => name.endsWith('.json')).sort()
  } catch (error) {
    if (isMissingFile(error)) return { version: 1, services: [] }
    throw error
  }

  const services: ServiceRecord[] = []
  for (const name of names) {
    const path = join(projects, name)
    const raw = await readFile(path, 'utf8')
    const parsed: unknown = JSON.parse(raw)
    services.push(...parseProject(parsed, path, name.slice(0, -'.json'.length)))
  }
  return { version: 1, services }
}

/** Write a normalized fixture as devreg project files. */
export async function writeRegistry(document: RegistryDocument, root = registryRoot()): Promise<void> {
  const projects = join(root, 'projects')
  await mkdir(projects, { recursive: true })
  const byProject = new Map<string, ServiceRecord[]>()
  for (const service of document.services) {
    const rows = byProject.get(service.project) ?? []
    rows.push(service)
    byProject.set(service.project, rows)
  }
  for (const [project, services] of byProject) {
    const data = {
      project: { name: project },
      services: services.map(toProjectService),
    }
    const path = join(projects, `${project}.json`)
    const temporary = join(projects, `.${project}.${process.pid}.tmp`)
    await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
    await rename(temporary, path)
  }
}

/** Return services registered for one project, or all services when omitted. */
export async function listServices(project?: string, root = registryRoot()): Promise<readonly ServiceRecord[]> {
  const services = (await readRegistry(root)).services
  return project ? services.filter(service => service.project === project) : services
}

/** Find duplicate registered ports. */
export async function findConflicts(root = registryRoot()): Promise<readonly ServiceRecord[][]> {
  const groups = new Map<number, ServiceRecord[]>()
  for (const service of await listServices(undefined, root)) {
    if (service.port === undefined) continue
    const group = groups.get(service.port) ?? []
    group.push(service)
    groups.set(service.port, group)
  }
  return [...groups.values()].filter(group => group.length > 1)
}

function parseProject(value: unknown, path: string, fallbackProject: string): ServiceRecord[] {
  if (!isRecord(value) || !Array.isArray(value.services)) {
    throw new Error(`invalid devreg project: ${path}`)
  }
  const projectValue = isRecord(value.project) && typeof value.project.name === 'string'
    ? value.project.name
    : fallbackProject
  const projectPath = isRecord(value.project) && typeof value.project.path === 'string'
    ? value.project.path
    : undefined
  return value.services.map((service, index) => parseService(
    service,
    `${path}:services[${index}]`,
    projectValue,
    projectPath,
  ))
}

function parseService(value: unknown, path: string, project: string, projectPath: string | undefined): ServiceRecord {
  if (!isRecord(value) || typeof value.project !== 'string' || typeof value.service !== 'string') {
    if (!isRecord(value) || typeof value.name !== 'string') {
      throw new Error(`invalid devreg service: ${path}`)
    }
  }
  const docker = isRecord(value.docker) ? value.docker : {}
  const envs = isRecord(value.envs) ? value.envs : {}
  const service = typeof value.service === 'string' ? value.service : value.name as string
  const result: ServiceRecord = { project, service }
  addIfDefined(result, 'port', numberValue(value.port))
  addIfDefined(result, 'host', stringValue(value.host))
  addIfDefined(result, 'kind', stringValue(value.kind) as ServiceRecord['kind'])
  addIfDefined(result, 'command', stringValue(value.command))
  addIfDefined(result, 'image', stringValue(docker.image))
  addIfDefined(result, 'container', stringValue(docker.container_name))
  addIfDefined(result, 'compose', stringValue(docker.compose))
  addIfDefined(result, 'status', stringValue(value.status) as ServiceRecord['status'])
  addIfDefined(result, 'statusSource', stringValue(value.status_source))
  addIfDefined(result, 'notes', stringValue(value.notes))
  addIfDefined(result, 'path', projectPath)
  addIfDefined(result, 'testUrl', environmentUrl(envs.test))
  addIfDefined(result, 'stagingUrl', environmentUrl(envs.staging))
  addIfDefined(result, 'prodUrl', environmentUrl(envs.prod))
  addIfDefined(result, 'updatedBy', stringValue(value.updated_by))
  addIfDefined(result, 'updatedAt', stringValue(value.updated_at))
  return result
}

function toProjectService(service: ServiceRecord): Record<string, unknown> {
  const result: Record<string, unknown> = { name: service.service }
  addIfDefined(result, 'port', service.port)
  addIfDefined(result, 'host', service.host)
  addIfDefined(result, 'kind', service.kind)
  addIfDefined(result, 'command', service.command)
  addIfDefined(result, 'status', service.status)
  addIfDefined(result, 'status_source', service.statusSource)
  addIfDefined(result, 'notes', service.notes)
  addIfDefined(result, 'updated_by', service.updatedBy)
  addIfDefined(result, 'updated_at', service.updatedAt)
  const docker: Record<string, unknown> = {}
  addIfDefined(docker, 'image', service.image)
  addIfDefined(docker, 'container_name', service.container)
  addIfDefined(docker, 'compose', service.compose)
  if (Object.keys(docker).length > 0) result.docker = docker
  const envs: Record<string, Record<string, string>> = {}
  addEnvironment(envs, 'test', service.testUrl)
  addEnvironment(envs, 'staging', service.stagingUrl)
  addEnvironment(envs, 'prod', service.prodUrl)
  if (Object.keys(envs).length > 0) result.envs = envs
  return result
}

function addEnvironment(target: Record<string, Record<string, string>>, name: string, url: string | undefined): void {
  if (url !== undefined) target[name] = { url }
}

function environmentUrl(value: unknown): string | undefined {
  return isRecord(value) ? stringValue(value.url) : undefined
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

function addIfDefined<T extends object, K extends keyof T>(target: T, key: K, value: T[K] | undefined): void {
  if (value !== undefined) target[key] = value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMissingFile(error: unknown): boolean {
  return isRecord(error) && error.code === 'ENOENT'
}

/** A registered development service. */
export interface ServiceRecord {
  readonly project: string
  readonly service: string
  readonly port?: number
  readonly host?: string
  readonly kind?: 'app' | 'db' | 'cache' | 'queue' | 'proxy' | 'worker'
  readonly command?: string
  readonly image?: string
  readonly container?: string
  readonly compose?: string
  readonly status?: 'declared' | 'running' | 'stopped' | 'unknown'
  readonly statusSource?: string
  readonly notes?: string
  readonly path?: string
  readonly testUrl?: string
  readonly stagingUrl?: string
  readonly prodUrl?: string
  readonly updatedBy?: string
  readonly updatedAt?: string
}

/** The normalized registry view exposed by the plugin. */
export interface RegistryDocument {
  readonly version: 1
  readonly services: readonly ServiceRecord[]
}

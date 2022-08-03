import { intersects } from 'semver'
import { Awaitable, Dict, pick, Time } from 'cosmokit'
import pMap from 'p-map'

export interface User {
  name: string
  email: string
  username?: string
}

export interface BasePackage {
  name: string
  version: string
  description: string
}

export interface PackageJson extends BasePackage {
  koishi?: Manifest
  keywords: string[]
  dependencies?: Dict<string>
  devDependencies?: Dict<string>
  peerDependencies?: Dict<string>
  optionalDependencies?: Dict<string>
}

export interface Manifest {
  hidden?: boolean
  description?: Dict<string>
  service?: {
    required?: string[]
    optional?: string[]
    implements?: string[]
  }
  locales?: string[]
}

export interface RemotePackage extends PackageJson {
  deprecated?: string
  author: User
  maintainers: User[]
  license: string
  dist: RemotePackage.Dist
}

export namespace RemotePackage {
  export interface Dist {
    shasum: string
    integrity: string
    tarball: string
    fileCount: number
    unpackedSize: number
  }
}

export interface Registry extends BasePackage {
  versions: Dict<RemotePackage>
  time: {
    created: string
    modified: string
  }
  license: string
  readme: string
  readmeFilename: string
}

export interface SearchPackage extends BasePackage {
  date: string
  links: Dict<string>
  author: User
  publisher: User
  maintainers: User[]
  keywords: string[]
}

export interface SearchObject {
  package: SearchPackage
  score: SearchObject.Score
  searchScore: number

  // extended fields
  official?: boolean
  publishSize?: number
  installSize?: number
}

export namespace SearchObject {
  export interface Score {
    final: number
    detail: Score.Detail
  }

  export namespace Score {
    export interface Detail {
      quality: number
      popularity: number
      maintenance: number
    }
  }
}

export interface SearchResult {
  total: number
  time: string
  objects: SearchObject[]
}

export interface AnalyzedPackage extends SearchPackage, SearchObject.Score.Detail {
  shortname: string
  official: boolean
  size: number
  license: string
  versions: RemotePackage[]
  manifest: Manifest
  score: number
}

export interface CollectConfig {
  step?: number
  timeout?: number
}

export interface AnalyzeConfig {
  version?: string
  concurrency?: number
  before?(object: SearchObject): void
  onSuccess?(item: AnalyzedPackage): Awaitable<void>
  onFailure?(name: string, reason: any): Awaitable<void>
  onSkipped?(name: string): Awaitable<void>
  after?(object: SearchObject): void
}

export interface ScanConfig extends CollectConfig, AnalyzeConfig {
  request<T>(url: string): Promise<T>
}

export function conclude(meta: PackageJson) {
  const manifest: Manifest = {
    description: {
      en: meta.description,
    },
    locales: [],
    ...meta.koishi,
    service: {
      required: [],
      optional: [],
      implements: [],
      ...meta.koishi?.service,
    },
  }

  for (const keyword of meta.keywords ?? []) {
    if (keyword === 'market:hidden') {
      manifest.hidden = true
    } else if (keyword.startsWith('required:')) {
      manifest.service.required.push(keyword.slice(9))
    } else if (keyword.startsWith('optional:')) {
      manifest.service.optional.push(keyword.slice(9))
    } else if (keyword.startsWith('impl:')) {
      manifest.service.implements.push(keyword.slice(5))
    } else if (keyword.startsWith('locale:')) {
      manifest.locales.push(keyword.slice(7))
    }
  }

  return manifest
}

export interface RequestConfig {
  timeout?: number
}

export default interface Scanner extends SearchResult {}

export default class Scanner {
  public progress = 0

  constructor(private request: <T>(url: string, config?: RequestConfig) => Promise<T>) {}

  private async search(offset: number, config: CollectConfig) {
    const { step = 250, timeout = Time.second * 30 } = config
    const result = await this.request<SearchResult>(`/-/v1/search?text=koishi+plugin&size=${step}&offset=${offset}`, { timeout })
    this.objects.push(...result.objects)
    return result.total
  }

  public async collect(config: CollectConfig = {}) {
    const { step = 250 } = config
    this.objects = []
    this.time = new Date().toUTCString()
    this.total = await this.search(0, config)
    for (let offset = this.objects.length; offset < this.total; offset += step) {
      await this.search(offset, config)
    }
  }

  public async process(object: SearchObject, range: string) {
    const { name } = object.package
    const official = name.startsWith('@koishijs/plugin-')
    const community = name.startsWith('koishi-plugin-')
    if (!official && !community) return

    const registry = await this.request<Registry>(`/${name}`)
    const versions = Object.values(registry.versions).filter((remote) => {
      const { dependencies, peerDependencies, deprecated } = remote
      const declaredVersion = { ...dependencies, ...peerDependencies }['koishi']
      try {
        return !deprecated && declaredVersion && intersects(range, declaredVersion)
      } catch {}
    }).reverse()
    if (!versions.length) return

    const latest = registry.versions[versions[0].version]
    latest.keywords ??= []
    const manifest = conclude(latest)
    if (manifest.hidden) return

    const shortname = official ? name.slice(17) : name.slice(14)
    const analyzed: AnalyzedPackage = {
      name,
      manifest,
      shortname,
      official,
      versions,
      score: object.score.final,
      size: latest.dist.unpackedSize,
      ...pick(object.package, ['date', 'links', 'publisher', 'maintainers']),
      ...pick(latest, ['keywords', 'version', 'description', 'license', 'author']),
      ...object.score.detail,
    }
    return analyzed
  }

  public async analyze(config: AnalyzeConfig) {
    const { concurrency = 5, version, before, onSuccess, onFailure, onSkipped, after } = config

    const result = await pMap(this.objects, async (object) => {
      before?.(object)
      const { name } = object.package
      try {
        const analyzed = await this.process(object, version)
        if (analyzed) {
          await onSuccess?.(analyzed)
          return analyzed
        } else {
          await onSkipped?.(name)
        }
      } catch (error) {
        await onFailure?.(name, error)
      } finally {
        this.progress += 1
        after?.(object)
      }
    }, { concurrency })

    return result.filter(Boolean)
  }
}

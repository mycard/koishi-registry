import { AnalyzedPackage, User } from '@koishijs/registry'
import { computed, ref } from 'vue'
import { Dict } from 'cosmokit'
import md5 from 'spark-md5'

export function getUsers(data: AnalyzedPackage) {
  const result: Record<string, User> = {}
  for (const user of data.contributors) {
    result[user.email] ||= user
  }
  if (!data.maintainers.some(user => result[user.email])) {
    return data.maintainers
  }
  return Object.values(result)
}

const aWeekAgo = new Date(Date.now() - 1000 * 3600 * 24 * 7).toISOString()

export interface Badge {
  text: string
  check(data: AnalyzedPackage): boolean
  query: string
}

export const badges: Dict<Badge> = {
  verified: {
    text: '官方认证',
    check: data => data.verified,
    query: 'is:verified',
  },
  insecure: {
    text: '不安全',
    check: data => data.insecure,
    query: 'is:insecure',
  },
  preview: {
    text: '开发中',
    check: data => data.manifest.preview,
    query: 'is:preview',
  },
  newborn: {
    text: '近期新增',
    check: data => data.createdAt >= aWeekAgo,
    query: `created:>${aWeekAgo}`,
  },
}

export const categories = {
  core: '核心功能',
  adapter: '适配器',
  storage: '存储服务',
  extension: '扩展功能',
  console: '控制台',
  manage: '管理工具',
  preset: '行为预设',
  image: '图片服务',
  media: '资讯服务',
  tool: '实用工具',
  ai: '人工智能',
  meme: '趣味交互',
  game: '娱乐玩法',
  gametool: '游戏工具',
}

export function useMarket(market: () => AnalyzedPackage[]) {
  const words = ref([''])

  const all = computed(() => {
    return Object.values(market()).filter((data) => {
      return !data.manifest.hidden || words.value.includes('show:hidden')
    })
  })

  const packages = computed(() => {
    return all.value.filter((data) => {
      const users = getUsers(data)
      return words.value.every(word => {
        let negate = false
        if (word.startsWith('-')) {
          negate = true
          word = word.slice(1)
        }
        return validate(data, word, users) !== negate
      })
    })
  })

  return { words, packages, all }
}

export function getAvatar(email: string, endpoint = 'https://s.gravatar.com') {
  return endpoint
    + '/avatar/'
    + (email ? md5.hash(email.toLowerCase()) : '')
    + '.png?d=mp'
}

function formatValue(value: number) {
  return value >= 100 ? +value.toFixed() : +value.toFixed(1)
}

export function formatSize(value: number) {
  if (value >= (1 << 20) * 1000) {
    return formatValue(value / (1 << 30)) + ' GB'
  } else if (value >= (1 << 10) * 1000) {
    return formatValue(value / (1 << 20)) + ' MB'
  } else {
    return formatValue(value / (1 << 10)) + ' KB'
  }
}

export function resolveCategory(name?: string) {
  if (categories[name]) return name
  return 'other'
}

export function validate(data: AnalyzedPackage, word: string, users: User[]) {
  const { locales, service } = data.manifest
  if (word.startsWith('impl:')) {
    return service.implements.includes(word.slice(5))
  } else if (word.startsWith('locale:')) {
    return locales.includes(word.slice(7))
  } else if (word.startsWith('using:')) {
    const name = word.slice(6)
    return service.required.includes(name) || service.optional.includes(name)
  } else if (word.startsWith('category:')) {
    return resolveCategory(data.category) === word.slice(9)
  } else if (word.startsWith('email:')) {
    return users.some(({ email }) => email === word.slice(6))
  } else if (word.startsWith('updated:<')) {
    return data.updatedAt < word.slice(9)
  } else if (word.startsWith('updated:>')) {
    return data.updatedAt >= word.slice(9)
  } else if (word.startsWith('created:<')) {
    return data.createdAt < word.slice(9)
  } else if (word.startsWith('created:>')) {
    return data.createdAt >= word.slice(9)
  } else if (word.startsWith('is:')) {
    if (word === 'is:verified') return data.verified
    if (word === 'is:insecure') return data.insecure
    if (word === 'is:preview') return data.manifest.preview
    return false
  } else if (word.startsWith('show:')) {
    return true
  }

  if (data.shortname.includes(word)) return true
  return data.keywords.some(keyword => keyword.includes(word))
}

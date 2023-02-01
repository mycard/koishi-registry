import { AnalyzedPackage, User } from '@koishijs/registry'
import { Dict } from 'cosmokit'
import {} from 'vue'

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

export function useMarket() {}

import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'
import { CONTENT_DIRS, extractScalar, type DirConfig } from './content.config'

// 如果2、3行有红色波浪线，尝试运行 `npm i --save-dev @types/node`

// 🌟 想改 base 名称，只需要改这里！部署到 https://<你的用户名>.github.io/<BASE_NAME>/。默认为空
export const BASE_NAME = 'blog'

// ── 手动读取 .env（配置文件运行在 Node.js 中，import.meta.env 不可用） ──
function loadEnv(filepath: string): Record<string, string> {
  const env: Record<string, string> = {}

  // 👉 加一行判断：如果文件不存在，直接返回空对象，或者去读系统的 process.env 作为备用
  if (!fs.existsSync(filepath)) {
    return process.env as Record<string, string>; 
  }
  
  for (const line of fs.readFileSync(filepath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq !== -1) env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return env
}
const env = loadEnv(path.resolve(process.cwd(), '.env'))

// 1. 定义一个 svg 对象
const bilibiliIcon = fs.readFileSync( path.resolve(process.cwd(), 'docs/bilibili.svg'), 'utf-8')

// ── 自动生成 sidebar ──
// 扫描 docs/<dir>/ 下所有 .md 文件，从 frontmatter 中读取 title 自动生成侧边栏条目
// index.md 固定显示为"首页"，其 frontmatter title 用作侧边栏分类标题
function autoSidebar(cfg: DirConfig): { text: string; items: Array<{ text: string; link: string }> } {
  const docsDir = path.resolve(process.cwd(), 'docs')
  const fullDir = path.join(docsDir, cfg.dir)

  if (!fs.existsSync(fullDir)) return { text: cfg.navText, items: [] }

  const mdFiles = fs.readdirSync(fullDir).filter(f => f.endsWith('.md'))

  // 从 index.md 的 frontmatter 中获取分类标题，fallback 为 navText
  let sectionText = cfg.navText
  const indexFile = mdFiles.find(f => f === 'index.md')
  if (indexFile) {
    const indexContent = fs.readFileSync(path.join(fullDir, indexFile), 'utf-8')
    const title = extractScalar(indexContent, 'title')
    if (title) sectionText = title
  }

  // 为每个 .md 文件生成侧边栏条目
  const items = mdFiles.map(file => {
    const name = path.basename(file, '.md')
    const content = fs.readFileSync(path.join(fullDir, file), 'utf-8')
    const title = extractScalar(content, 'title')
    const text = name === 'index' ? '首页' : (title || name)
    return { text, link: `/${cfg.dir}/${name}` }
  })

  // index 排最前，其余按中文拼音排序
  items.sort((a, b) => {
    if (a.link.endsWith('/index')) return -1
    if (b.link.endsWith('/index')) return 1
    return a.text.localeCompare(b.text, 'zh')
  })

  return { text: sectionText, items }
}

export default defineConfig({
  title: "韩会会-QDFZZ. 的博客",
  description: "想写啥就写啥。",
  cleanUrls: true, // 去掉网页地址栏的 .html 后缀
  lastUpdated: true, // 显示最后更新时间
  base: `/${BASE_NAME}/`, 

  themeConfig: {
    logo: '/logo.ico',
    outline: {
      level: 'deep', // 显示二级及以下标题
    },

    lastUpdated: {
      text: '最近更新于 ',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },

    // ⬇️ 加上这一行，可以在每篇文章的左下角自动生成"返回顶部"的链接
    docFooter: {
        prev: '上一篇',
        next: '下一篇'
    },

    // ⬇️ 只需要加上这一段，网站右上角就会出现强大的搜索框
    search: {
      provider: 'algolia',
      options: {
        appId: env.VITE_ALGOLIA_APP_ID,
        apiKey: env.VITE_ALGOLIA_API_KEY,
        indexName: env.VITE_ALGOLIA_INDEX_NAME,
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索' },
              modal: {
                searchBox: { resetButtonTitle: '清除查询条件' },
                noResultsScreen: { noResultsText: '无法找到相关结果' },
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
              }
            }
          }
        }
      }
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hhhqdfzz' },
      { icon: {svg:bilibiliIcon}, link: 'https://space.bilibili.com/550025007?spm_id_from=333.1007.0.0' }
    ],

    nav: [
      { text: 'Home', link: '/' },
      ...CONTENT_DIRS.map(d => ({ text: d.navText, link: `/${d.dir}` })),
    ],

    // ⬇️ 文档左侧栏 - 从 CONTENT_DIRS 自动生成
    // 新增/删除笔记或修改标题后无需手动更新 sidebar
    sidebar: Object.fromEntries(
      CONTENT_DIRS.map(d => [`/${d.dir}/`, [autoSidebar(d)]])
    )
  }
})

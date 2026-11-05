import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import fs from 'fs'
import path from 'path'
import { CONTENT_DIRS, buildNav, extractScalar, resolveDirTitle, type DirEntry } from './content.config'

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
function autoSidebar(cfg: DirEntry): { text: string; items: Array<{ text: string; link: string }> } {
  const docsDir = path.resolve(process.cwd(), 'docs')
  const fullDir = path.join(docsDir, cfg.dir)

  if (!fs.existsSync(fullDir)) return { text: resolveDirTitle(cfg.dir), items: [] }

  const mdFiles = fs.readdirSync(fullDir).filter(f => f.endsWith('.md'))

  // 分类标题与导航栏显示名保持同一套规则（navText → index.md 的 title → 目录名）
  const sectionText = resolveDirTitle(cfg.dir)

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

// ── 递归版导航组件 ──
// 默认主题用相对路径导入 VPMenu / VPNavScreenMenuGroupSection，
// 裸路径 alias 匹配不到，只能用 resolveId 按「解析后的绝对路径」精确拦截。
// 被拦截的组件改用 theme/components/ 下的自定义实现：
//   · VPMenu                        —— 分组改为可悬停展开的级联面板
//   · VPNavScreenMenuGroupSection   —— 移动端递归分组
// 使导航层级不再受默认主题的三层限制。
const RECURSIVE_NAV_COMPONENTS = ['VPMenu.vue', 'VPNavScreenMenuGroupSection.vue']

function recursiveNavPlugin() {
  const themeComponentsDir = path.resolve(process.cwd(), 'docs/.vitepress/theme/components')

  return {
    name: 'blog:recursive-nav-components',
    enforce: 'pre' as const,
    resolveId(source: string, importer: string | undefined) {
      if (!importer) return null

      // 只处理来自 VitePress 默认主题目录的相对导入
      if (!importer.includes('vitepress/dist/client/theme-default/components')) return null

      const fileName = path.basename(source)
      if (!RECURSIVE_NAV_COMPONENTS.includes(fileName)) return null

      return path.join(themeComponentsDir, fileName)
    },
  }
}

export default withMermaid(defineConfig({
  title: "韩会会-QDFZZ. 的博客",
  description: "想写啥就写啥。",
  cleanUrls: true, // 去掉网页地址栏的 .html 后缀
  lastUpdated: true, // 显示最后更新时间
  base: `/${BASE_NAME}/`,

  // ⬇️ 用自定义组件替换默认主题的菜单组件
  // 默认主题的 VPMenu 把分组渲染成一行静态标题，无法再往下分；
  // 这里替换成级联面板实现，让 content.config.ts 里的 NAV 可以写任意层数。
  vite: {
    plugins: [recursiveNavPlugin()],
  },

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
      { icon: 'github', link: 'https://github.com/hhhqdfzz/blog' },
      { icon: {svg:bilibiliIcon}, link: 'https://space.bilibili.com/550025007?spm_id_from=333.1007.0.0' }
    ],

    // 导航栏结构完全由 content.config.ts 决定（下拉分组 / 显示文字 / 顺序）
    nav: buildNav(),

    // ⬇️ 文档左侧栏 - 从 CONTENT_DIRS 自动生成
    // 新增/删除笔记或修改标题后无需手动更新 sidebar
    sidebar: Object.fromEntries(
      CONTENT_DIRS.map(d => [`/${d.dir}/`, [autoSidebar(d)]])
    )
  },

  // 核心配置：优化 Mermaid 渲染引擎
  mermaid: {
    // 强制将样式内联注入到 SVG 标签内，彻底解决 Inkscape 等外部软件打开全黑的问题
    theme: 'default', 
    mermaidHtmlClass: 'custom-mermaid-svg',
    // 核心修改：重新启用 HTML 标签渲染文字，保证网页和初始排版位置 100% 绝对精准
    htmlLabels: true 
  },

  markdown: {
    config: (md) => {
      // 拦截 Markdown 渲染器：在编译时把原始的 mermaid 源码藏进 dataset 属性里
      const defaultRenderer = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.trim() === 'mermaid') {
          // 讲原始的源码安全地进行 Base64 编码，防止特殊字符破坏 HTML 结构
          const rawCode = Buffer.from(token.content).toString('base64');
          return `<div class="custom-mermaid-container" data-raw="${rawCode}">${defaultRenderer(tokens, idx, options, env, self)}</div>`;
        }
        return defaultRenderer(tokens, idx, options, env, self);
      }
    }
  }
}))

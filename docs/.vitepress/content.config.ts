// ── 导航栏配置（唯一数据源） ──
//
// 顶部导航栏的所有内容都写在这一个数组里，数组顺序 = 导航栏显示顺序：
//   · { text, link }     普通链接（例如首页 Home）
//   · { dir }            单个目录，显示文字自动取 docs/<dir>/index.md 的 title
//   · { text, items }    下拉分组，items 里可以继续嵌套分组，**层级不限**，
//                        想写几层就写几层。
//                        嵌套分组同样是「悬停展开」，会弹出二级浮层面板，
//                        交互与顶栏的一级下拉完全一致。
//
// 例（操作系统里再分一层 Linux）：
//   {
//     text: '操作系统',
//     items: [
//       { text: 'Linux', items: [ { dir: 'Server' }, { dir: 'LinuxBasis' } ] },
//       { dir: 'macOS' },
//     ],
//   }
//
// 显示文字默认自动取 index.md 的 frontmatter title，所以「目录名」和「显示名」
// 不必相同（例如 LinuxBasis 显示为「Linux 基础」）；需要改名时补一个 navText 即可覆盖。
//
// 下面的 CONTENT_DIRS / DIR_TO_NAV / GLOB_PATTERNS 都是从这个数组自动派生的，
// 不要手动改。

import fs from 'node:fs'
import path from 'node:path'

/** 单个目录条目 */
export interface DirEntry {
  dir: string       // docs 下的目录名，如 'SoftShare'
  navText?: string  // 显示文字（可选）；不填则自动取 index.md 的 title
}

/** 下拉分组条目（可递归嵌套子分组） */
export interface GroupEntry {
  text: string      // 分组标题（导航栏上显示，后面自带 ⌄ 箭头）
  items: NavEntry[] // 子项：可以是目录、链接，也可以继续是分组
}

/** 普通链接条目 */
export interface LinkEntry {
  text: string
  link: string
}

/** 导航栏条目：链接 / 目录 / 分组 */
export type NavEntry = LinkEntry | DirEntry | GroupEntry

export const NAV: NavEntry[] = [
  { text: 'Home', link: '/' },
  { dir: 'SoftShare' },
  {
    text: '操作系统',
    items: [
      // 不指定 navText时，取 index.md 的标题
      { dir: 'WindowsNotes', navText: 'Windows 笔记' }, 
      // 有子导航的导航，需要指定 text 和 items。items的元素也可以是有子导航的导航，形成多级嵌套。
      {
        text: 'Linux',
        items: [
          { dir: 'LinuxBasis'},
          { dir: 'Server'},
        ]
      },
      { dir: 'macOS' },
    ],
  },
]

// ── 以下为自动派生，不要手动改 ──

/** 简单 YAML 标量字段提取（Node.js 端用，避免引入 gray-matter） */
export function extractScalar(raw: string, field: string): string | undefined {
  const m = raw.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))
  return m ? m[1].trim() : undefined
}

/** docs 目录的绝对路径 */
function docsRoot(): string {
  return path.resolve(process.cwd(), 'docs')
}

/** 读取 docs/<dir>/index.md 的 frontmatter title */
export function readDirTitle(dir: string): string | undefined {
  try {
    const file = path.join(docsRoot(), dir, 'index.md')
    if (!fs.existsSync(file)) return undefined
    return extractScalar(fs.readFileSync(file, 'utf-8'), 'title')
  } catch {
    return undefined
  }
}

/** 递归收集某些条目下的所有目录条目 */
function collectDirEntries(entries: NavEntry[]): DirEntry[] {
  return entries.flatMap(entry =>
    'dir' in entry ? [entry] : 'items' in entry ? collectDirEntries(entry.items) : []
  )
}

/** 展平后的目录清单（保持导航栏中的出现顺序） */
export const CONTENT_DIRS: DirEntry[] = collectDirEntries(NAV)

/** dir → 目录条目 快查表 */
const DIR_ENTRIES = new Map(CONTENT_DIRS.map(entry => [entry.dir, entry]))

/** 目录在导航栏上的显示文字：显式 navText → index.md 的 title → 目录名 */
export function resolveDirTitle(dir: string): string {
  const entry = DIR_ENTRIES.get(dir)
  return entry?.navText || readDirTitle(dir) || dir
}

/** dir → 显示文字 快查表 */
export const DIR_TO_NAV: Record<string, string> = Object.fromEntries(
  CONTENT_DIRS.map(entry => [entry.dir, resolveDirTitle(entry.dir)])
)

/** createContentLoader 用的 glob 模式（相对于 docs/） */
export const GLOB_PATTERNS: string[] = CONTENT_DIRS.map(entry => `${entry.dir}/**/*.md`)

// ── 导航栏结构（可直接给 VitePress 的 themeConfig.nav 用） ──

export interface NavLinkItem {
  text: string
  link: string
  activeMatch?: string
}

export interface NavGroupItem {
  text: string
  items: NavItem[]
  activeMatch?: string
}

export type NavItem = NavLinkItem | NavGroupItem

/** 转义正则元字符，保证目录名能被安全地写进 activeMatch */
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 构建 VitePress 的 themeConfig.nav
 * 数组顺序原样保留，平铺项与下拉分组的位置完全由 NAV 的书写顺序决定；
 * 分组可以任意层级嵌套，每一层的 activeMatch 都覆盖其全部子目录。
 */
export function buildNav(): NavItem[] {
  return NAV.map<NavItem>(entry => buildNavEntry(entry))
}

/** 递归转换单个条目 */
function buildNavEntry(entry: NavEntry): NavItem {
  // ── 普通链接 ──
  if ('link' in entry) {
    return { text: entry.text, link: entry.link }
  }

  // ── 单个目录 ──
  if ('dir' in entry) {
    return {
      text: resolveDirTitle(entry.dir),
      link: `/${entry.dir}`,
      activeMatch: `^/${escapeRegExp(entry.dir)}`,
    }
  }

  // ── 下拉分组（可继续嵌套）──
  const dirs = collectDirEntries(entry.items).map(item => item.dir)
  return {
    text: entry.text,
    items: entry.items.map(buildNavEntry),
    // 分组自身的高亮范围 = 其下所有目录
    activeMatch: dirs.length ? `^/(${dirs.map(escapeRegExp).join('|')})` : undefined,
  }
}

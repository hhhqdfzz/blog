// ── 内容目录 & 导航映射（唯一数据源） ──
// 新增内容目录时只改这一个数组，nav、sidebar、data loader 全部自动更新

export interface DirConfig {
  dir: string      // docs 下的目录名，如 'SoftShare'
  navText: string  // 导航栏显示文字，如 '实用软件分享'
}

export const CONTENT_DIRS: DirConfig[] = [
  { dir: 'SoftShare', navText: '实用软件分享' },
  { dir: 'LinuxBasis', navText: 'Linux 基础' },
]

// ── 以下为自动派生，不要手动改 ──

/** dir → navText 快查表 */
export const DIR_TO_NAV: Record<string, string> = Object.fromEntries(
  CONTENT_DIRS.map(d => [d.dir, d.navText])
)

/** createContentLoader 用的 glob 模式（相对于 docs/） */
export const GLOB_PATTERNS: string[] = CONTENT_DIRS.map(d => `${d.dir}/**/*.md`)

/** 简单 YAML 标量字段提取（Node.js 端用，避免引入 gray-matter） */
export function extractScalar(raw: string, field: string): string | undefined {
  const m = raw.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))
  return m ? m[1].trim() : undefined
}

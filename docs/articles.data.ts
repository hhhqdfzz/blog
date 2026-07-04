import fs from 'fs'
import path from 'path'
import { DIR_TO_NAV, GLOB_PATTERNS } from './.vitepress/content.config'

interface ArticleEntry {
  url: string
  frontmatter: Record<string, any>
  sectionDir: string
  sectionNav: string | null
  isIndex: boolean
}

function parseFrontmatter(raw: string): Record<string, any> {
  // 兼容 CRLF (\r\n) 和 LF (\n) 两种换行符
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const fm: Record<string, any> = {}
  // 按 \n 或 \r\n 拆分行
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w[\w-]*):\s*(.+)$/)
    if (!m) continue
    const key = m[1]
    let val: string = m[2].trim()
    // 解析 YAML 数组 [a, b, c]
    if (val.startsWith('[') && val.endsWith(']')) {
      fm[key] = val.slice(1, -1).split(',').map((s: string) => s.trim())
    } else {
      fm[key] = val
    }
  }
  return fm
}

function globFiles(baseDir: string, pattern: string): string[] {
  // pattern like "SoftShare/**/*.md" — relative to baseDir
  const parts = pattern.split('/')
  const dir = parts[0]
  const fullDir = path.join(baseDir, dir)

  if (!fs.existsSync(fullDir)) return []

  const results: string[] = []
  const walk = (currentDir: string, prefix: string) => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
      const entryPath = path.join(currentDir, entry.name)
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        walk(entryPath, relativePath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(relativePath)
      }
    }
  }

  walk(fullDir, dir)
  return results
}

export default {
  load(): ArticleEntry[] {
    const docsDir = path.resolve(process.cwd(), 'docs')

    const files = new Set<string>()
    for (const pattern of GLOB_PATTERNS) {
      for (const f of globFiles(docsDir, pattern)) {
        files.add(f)
      }
    }

    const results: ArticleEntry[] = []
    for (const relPath of [...files].sort()) {
      const fullPath = path.join(docsDir, relPath)
      const raw = fs.readFileSync(fullPath, 'utf-8')
      const cleanPath = relPath.replace(/\.md$/, '')
      const segs = cleanPath.split('/')
      const isIndex = segs[segs.length - 1] === 'index'

      results.push({
        url: '/' + cleanPath,
        frontmatter: parseFrontmatter(raw),
        sectionDir: segs[0],
        sectionNav: DIR_TO_NAV[segs[0]] || null,
        isIndex,
      })
    }

    return results
  }
}

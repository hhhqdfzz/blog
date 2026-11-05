/**
 * 级联面板定位算法的单元测试。
 * 运行: node --experimental-strip-types cascade.test.ts
 */
import { resolveCascade, PANEL_GAP } from './cascade.ts'

let pass = 0
let fail = 0

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    pass++
    console.log(`  ✅ ${name}`)
  } else {
    fail++
    console.log(`  ❌ ${name}\n       期望 ${e}\n       实际 ${a}`)
  }
}

const viewport = { width: 1280, height: 900 }
const panel = { width: 270, height: 120 }

console.log('\n【1】右侧空间充足 → 向右展开')
{
  const r = resolveCascade({
    trigger: { top: 120, left: 500, right: 750 },
    panel, viewport, inheritedDir: null,
  })
  check('dir', r.dir, 'right')
  check('flip', r.flip, false)
  check('overlay', r.overlay, false)
  check('top 相对偏移', r.top, -PANEL_GAP)
}

console.log('\n【2】右侧空间不足 → 改为向左展开')
{
  const r = resolveCascade({
    trigger: { top: 120, left: 900, right: 1150 },
    panel, viewport, inheritedDir: null,
  })
  check('dir', r.dir, 'left')
  check('flip', r.flip, true)
  check('overlay', r.overlay, false)
}

console.log('\n【3】祖先已向左 → 本级保持向左（方向继承，不锯齿）')
{
  const r = resolveCascade({
    trigger: { top: 120, left: 200, right: 450 },
    panel, viewport, inheritedDir: 'left',
  })
  check('dir', r.dir, 'left')
  check('flip', r.flip, true)
}

console.log('\n【4】祖先已向右 → 本级也保持向右')
{
  const r = resolveCascade({
    trigger: { top: 120, left: 200, right: 450 },
    panel, viewport, inheritedDir: 'right',
  })
  check('dir', r.dir, 'right')
}

console.log('\n【5】所选方向放不下 → 就地展开（不溢出视口）')
{
  const r = resolveCascade({
    trigger: { top: 120, left: 51, right: 321 },
    panel, viewport, inheritedDir: 'left',
  })
  check('overlay', r.overlay, true)
}

console.log('\n【6】祖先已就地展开 → 本级继承就地展开')
{
  const r = resolveCascade({
    trigger: { top: 120, left: 200, right: 450 },
    panel, viewport, inheritedDir: 'left', inheritedOverlay: true,
  })
  check('overlay', r.overlay, true)
}

console.log('\n【7】垂直方向：底部空间不足 → 面板上移')
{
  const r = resolveCascade({
    trigger: { top: 860, left: 300, right: 550 },
    panel: { width: 270, height: 200 },
    viewport, inheritedDir: null,
  })
  check('面板顶边在视口内', r.top + 860 <= 900 - 12, true)
  check('面板顶边位置正确', r.top + 860, 900 - 12 - 200)
}

console.log('\n【8】垂直方向：顶部空间不足 → 面板下移')
{
  const r = resolveCascade({
    trigger: { top: 20, left: 300, right: 550 },
    panel: { width: 270, height: 200 },
    viewport, inheritedDir: null,
  })
  check('面板顶边不低于视口上沿', r.top + 20 >= 12, true)
}

// ─────────────────────────────────────────────────────────────
// 【9】各种视口尺寸下的级联模拟
// 模拟真实的级联过程：每一级都继承上一级的方向 / 就地展开状态，
// 断言任何一级面板都不会越出视口。
// ─────────────────────────────────────────────────────────────
interface Size { name: string; width: number; height: number }

const SIZES: Size[] = [
  { name: '4K 宽屏', width: 3840, height: 2160 },
  { name: '1920 桌面', width: 1920, height: 1080 },
  { name: '1440 笔记本', width: 1440, height: 900 },
  { name: '1280 常见', width: 1280, height: 800 },
  { name: '1024 小笔记本', width: 1024, height: 768 },
  { name: '860 窄窗', width: 860, height: 640 },
  { name: '768 断点', width: 768, height: 600 },
  { name: '600 很窄', width: 600, height: 800 },
  { name: '414 手机竖屏', width: 414, height: 896 },
  { name: '360 小手机', width: 360, height: 740 },
]

console.log('\n【9】各种视口尺寸下的 5 级级联')
for (const size of SIZES) {
  const vp = { width: size.width, height: size.height }
  // 面板宽度取内容实际宽度的量级：窄视口下文字换行会更窄一些
  const pw = Math.min(270, Math.max(120, size.width - 48))
  const ph = 120

  // 一级面板由顶栏按钮下方弹出，这里模拟它的位置：
  // 顶栏「操作系统」按钮大致在视口 55%~70% 处，但不能超出视口本身
  const panelWidth = pw
  let left = Math.min(Math.round(size.width * 0.62), size.width - panelWidth)
  left = Math.max(0, left)
  let top = 90
  let dir: 'left' | 'right' | null = null
  let overlay = false
  let ok = true
  const trace: string[] = []

  for (let i = 0; i < 5; i++) {
    const r = resolveCascade({
      trigger: { top, left, right: left + panelWidth },
      panel: { width: pw, height: ph },
      viewport: vp,
      inheritedDir: dir,
      inheritedOverlay: overlay,
    })
    dir = r.dir
    overlay = r.overlay

    let panelLeft: number
    if (r.overlay) {
      panelLeft = left // 流式展开，不横向移动
      trace.push('就地')
    } else if (r.dir === 'left') {
      panelLeft = left - PANEL_GAP - pw
      left = panelLeft
      trace.push('向左')
    } else {
      panelLeft = left + PANEL_GAP
      left = panelLeft
      trace.push('向右')
    }
    const panelRight = panelLeft + pw

    if (panelLeft < 0 || panelRight > size.width) ok = false
    if (r.top + top < 0 || r.top + top + ph > size.height) ok = false
  }

  check(
    `${size.name} (${size.width}×${size.height}) 5 级级联不越界 [${trace.join('→')}]`,
    ok,
    true,
  )
}

console.log('\n【10】面板比视口还宽的极端情况 → 必须退化为就地展开')
{
  const vp = { width: 320, height: 600 }
  const r = resolveCascade({
    trigger: { top: 100, left: 20, right: 280 },
    panel: { width: 400, height: 100 },
    viewport: vp, inheritedDir: null,
  })
  check('overlay', r.overlay, true)
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败\n`)
process.exit(fail ? 1 : 0)

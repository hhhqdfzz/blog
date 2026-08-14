<script setup>
import { onMounted, onUnmounted } from 'vue'

let observer = null

const SVG_NS = 'http://www.w3.org/2000/svg'

// 屏幕坐标 → SVG 用户坐标（自动抵消 viewBox / transform / 缩放）
const toUser = (svgEl, sx, sy) => {
  const ctm = svgEl.getScreenCTM()
  if (!ctm) return { x: sx, y: sy }
  const p = new DOMPoint(sx, sy).matrixTransform(ctm.inverse())
  return { x: p.x, y: p.y }
}

// 把一个 foreignObject 里的 HTML 文字转成原生 SVG <text>，返回恢复函数（导出时用来还原现场）
const translateForeignObject = (fo, svgEl) => {
  const inner = fo.querySelector('div, span, p') || fo
  const rawText = (inner.innerText || inner.textContent || '').trim()
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length === 0) return null

  const cs = window.getComputedStyle(inner)
  const rect = inner.getBoundingClientRect()
  if (!rect.width && !rect.height) return null

  // 字体尺寸与行高
  const fontSize = parseFloat(cs.fontSize) || 13
  const lineHeight = cs.lineHeight === 'normal' ? fontSize * 1.2 : (parseFloat(cs.lineHeight) || fontSize * 1.2)

  // 水平对齐（mermaid 标签默认居中）
  let anchor = 'middle'
  let textX = rect.left + rect.width / 2
  const align = cs.textAlign
  if (align === 'left' || align === 'start') { anchor = 'start'; textX = rect.left }
  else if (align === 'right' || align === 'end') { anchor = 'end'; textX = rect.right }

  const textEl = document.createElementNS(SVG_NS, 'text')
  textEl.setAttribute('text-anchor', anchor)

  // 内联字体与颜色（inline style 优先级最高，保证跨浏览器/Inkscape 与网页一致）
  const styleParts = [
    `font-family: ${cs.fontFamily}`,
    `font-size: ${fontSize}px`,
    `font-weight: ${cs.fontWeight}`,
    `font-style: ${cs.fontStyle}`,
    `fill: ${cs.color}`,
  ]
  if (cs.letterSpacing && cs.letterSpacing !== 'normal') styleParts.push(`letter-spacing: ${cs.letterSpacing}`)
  if (cs.textDecorationLine && cs.textDecorationLine !== 'none') styleParts.push(`text-decoration: ${cs.textDecorationLine}`)
  textEl.setAttribute('style', styleParts.join('; '))

  // 多行文字整块垂直居中
  const totalHeight = lineHeight * lines.length
  const centerY = rect.top + rect.height / 2
  lines.forEach((line, idx) => {
    const tspan = document.createElementNS(SVG_NS, 'tspan')
    tspan.textContent = line
    const pos = toUser(svgEl, textX, centerY - totalHeight / 2 + lineHeight * (idx + 0.5))
    tspan.setAttribute('x', pos.x.toString())
    tspan.setAttribute('y', pos.y.toString())
    textEl.appendChild(tspan)
  })

  // 挂到根节点（用户坐标系），并隐藏原 HTML 文字
  svgEl.appendChild(textEl)
  fo.style.display = 'none'

  return () => {
    fo.style.display = ''
    textEl.remove()
  }
}

// 是否需要 foreignObject 回退：Android WebView 对 foreignObject 支持差，标签会空白/错位
const needsForeignObjectFallback = () => /Android/i.test(navigator.userAgent)

onMounted(() => {
  // 1. 给页面上所有的 mermaid 容器静态挂载工具栏
  const initToolbars = () => {
    const containers = document.querySelectorAll('.custom-mermaid-container')
    containers.forEach(container => {
      if (container.querySelector('.mm-actions-bar')) return

      const actionBar = document.createElement('div')
      actionBar.className = 'mm-actions-bar'
      actionBar.innerHTML = `
        <button class="mm-btn" data-type="copy">复制源码</button>
        <button class="mm-btn" data-type="svg">导出 SVG</button>
        <button class="mm-btn" data-type="png">导出 PNG</button>
      `
      container.appendChild(actionBar)
    })
  }

  // 给不支持 foreignObject 的设备（Android）把 HTML 文字回退成原生 SVG 文字
  const applyTextFallback = () => {
    if (!needsForeignObjectFallback()) return
    document.querySelectorAll('.custom-mermaid-container').forEach(container => {
      if (container.dataset.textFallback === 'done') return
      const svg = container.querySelector('svg')
      if (!svg) return // mermaid 还没渲染完，等下次 DOM 变化再处理
      const fos = svg.querySelectorAll('foreignObject')
      if (fos.length === 0) {
        container.dataset.textFallback = 'done'
        return
      }
      fos.forEach(fo => translateForeignObject(fo, svg))
      container.dataset.textFallback = 'done'
    })
  }

  initToolbars()
  applyTextFallback()

  // 2. 监听 DOM 变化：SPA 导航或 Mermaid 异步渲染出新容器时，自动补挂工具栏 + 文字回退
  let scheduled = false
  observer = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      initToolbars()
      applyTextFallback()
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })

  // 3. 利用事件委托，处理按钮的点击下载与复制
  document.addEventListener('click', (e) => {
    const target = e.target
    if (!target.classList.contains('mm-btn')) return

    const type = target.getAttribute('data-type')
    const container = target.closest('.custom-mermaid-container')
    if (!container) return

    const svgEl = container.querySelector('svg')
    if (!svgEl) return

    // ================= 复制源码 =================
    if (type === 'copy') {
      const base64Code = container.getAttribute('data-raw')
      if (base64Code) {
        const rawText = decodeURIComponent(escape(atob(base64Code)));
        navigator.clipboard.writeText(rawText).then(() => {
          alert('🎨 已成功复制 Mermaid 源码！')
        })
      }
    }

    // ================= 导出 SVG：把 foreignObject 里的 HTML 文字转成原生 <text>，浏览器/Inkscape 都能看到文字 =================
    else if (type === 'svg') {
      try {
        const restoreActions = []

        // 1. 根节点：补齐命名空间 + 纯白背景（防透明 / 打开全黑）
        const rootOriginalStyle = svgEl.getAttribute('style')
        restoreActions.push(() => {
          if (rootOriginalStyle === null) svgEl.removeAttribute('style')
          else svgEl.setAttribute('style', rootOriginalStyle)
        })
        svgEl.setAttribute('xmlns', SVG_NS)
        svgEl.style.background = '#ffffff'
        svgEl.style.backgroundColor = '#ffffff'

        // 2. 内联所有图形的计算样式，让导出的 SVG 彻底不依赖网页外部 CSS
        svgEl.querySelectorAll('rect, circle, ellipse, polygon, path, line').forEach(el => {
          const cs = window.getComputedStyle(el)
          const originalStyle = el.getAttribute('style')
          restoreActions.push(() => {
            if (originalStyle === null) el.removeAttribute('style')
            else el.setAttribute('style', originalStyle)
          })

          el.style.setProperty('fill', (cs.fill && cs.fill !== 'none') ? cs.fill : 'none')
          el.style.setProperty('stroke', (cs.stroke && cs.stroke !== 'none') ? cs.stroke : 'none')
          if (cs.strokeWidth && cs.strokeWidth !== '0px') el.style.setProperty('stroke-width', cs.strokeWidth)
          if (cs.strokeDasharray && cs.strokeDasharray !== 'none') el.style.setProperty('stroke-dasharray', cs.strokeDasharray)
          if (cs.strokeLinecap && cs.strokeLinecap !== 'butt') el.style.setProperty('stroke-linecap', cs.strokeLinecap)
          if (cs.opacity && cs.opacity !== '1') el.style.setProperty('opacity', cs.opacity)
        })

        // 3. 复用 translateForeignObject 把 foreignObject 文字转成原生 <text>
        Array.from(svgEl.querySelectorAll('foreignObject')).forEach(fo => {
          const restore = translateForeignObject(fo, svgEl)
          if (restore) restoreActions.push(restore)
        })

        // 4. 序列化
        const serializer = new XMLSerializer()
        const source = serializer.serializeToString(svgEl)

        // 5. 复位所有改动，保证网页外观无波动
        restoreActions.reverse().forEach(action => action())

        // 6. 下载（优先系统分享，兼容 iOS/Android 不支持 <a download> 的浏览器）
        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
        saveFile(blob, 'mermaid-diagram.svg')
      } catch (globalError) {
        alert('导出失败，请检查控制台：' + globalError.message)
      }
    }

    // ================= 稳妥导出 PNG =================
    else if (type === 'png' && svgEl) {
      const rect = svgEl.getBoundingClientRect()
      const width = svgEl.viewBox?.baseVal?.width || rect.width || 800
      const height = svgEl.viewBox?.baseVal?.height || rect.height || 600

      const serializer = new XMLSerializer()
      const source = serializer.serializeToString(svgEl)

      const img = new Image()
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width * 2
        canvas.height = height * 2
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.scale(2, 2)
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            if (blob) saveFile(blob, 'diagram.png')
            else alert('图片转换失败，请尝试导出 SVG')
          }, 'image/png')
        }
      }
    }
  })
})

onUnmounted(() => {
  observer?.disconnect()
})

// 跨浏览器保存文件：优先系统分享（移动端/不支持 <a download> 的浏览器最可靠），失败再回退 <a download>
const saveFile = async (blob, filename) => {
  try {
    const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename })
      return
    }
  } catch (err) {
    if (err && err.name === 'AbortError') return // 用户取消分享，不再兜底下载
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<template>
  <div style="display: none;"></div>
</template>

<style>
/* 容器样式：宽图保持原样且支持横向滚动条 */
.custom-mermaid-container {
  position: relative;
  margin: 24px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 24px;
  background: var(--vp-c-bg-elv) !important;
  overflow-x: auto !important;
  display: block !important;
}

.custom-mermaid-container svg {
  max-width: none !important;
  height: auto !important;
}

/* 工具栏样式 */
.mm-actions-bar {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

/* 纯 CSS 悬浮显示 */
.custom-mermaid-container:hover .mm-actions-bar {
  opacity: 1 !important;
  pointer-events: auto !important;
}

/* 按钮样式 */
.mm-btn {
  background: var(--vp-c-brand-1, #3eaf7c) !important;
  color: white !important;
  border: none !important;
  padding: 5px 12px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  transition: background 0.2s, transform 0.1s !important;
}

.mm-btn:hover {
  filter: brightness(1.1) !important;
}

.mm-btn:active {
  transform: scale(0.95) !important;
}
</style>

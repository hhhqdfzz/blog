/**
 * 级联面板的定位算法（纯函数，便于独立测试）。
 *
 * 面板是绝对定位在触发器容器旁的，所以定位结果最终要换算成
 * 「相对触发器容器的偏移」。这里统一用视口坐标计算，再换算。
 */

/** 展开方向 */
export type CascadeDir = 'left' | 'right'

/** 面板与触发器容器边缘的间距：一级面板的 padding(12) + border(1) */
export const PANEL_GAP = 13

/** 视口边距：面板与视口边缘至少留这么远 */
export const VIEWPORT_MARGIN = 12

export interface CascadeInput {
  /** 触发器在视口中的位置 */
  trigger: { top: number; left: number; right: number }
  /** 面板自身的尺寸 */
  panel: { width: number; height: number }
  /** 视口尺寸 */
  viewport: { width: number; height: number }
  /** 祖先面板已决定的方向；null 表示本级自行判断 */
  inheritedDir: CascadeDir | null
  /** 祖先面板是否已退化为就地展开；为 true 时本级同样就地展开 */
  inheritedOverlay?: boolean
}

export interface CascadeOutput {
  /** 展开方向 */
  dir: CascadeDir
  /** 是否向左展开（对应 .flip 样式类） */
  flip: boolean
  /** 垂直方向相对触发器的偏移（px） */
  top: number
  /**
   * 左右两侧都放不下时的兜底：面板改为在触发器下方就地展开，
   * 而不是溢出视口或盖住前面的面板。
   */
  overlay: boolean
  /** 兜底展开时是向下还是向上 */
  overlayBelow: boolean
}

export function resolveCascade(input: CascadeInput): CascadeOutput {
  const { trigger, panel, viewport, inheritedDir, inheritedOverlay } = input

  // ── 水平方向 ──
  // 祖先已决定向左就保持向左，避免层层累积造成锯齿式扩张
  let dir: CascadeDir
  if (inheritedDir === 'left') {
    dir = 'left'
  } else {
    dir = viewport.width - trigger.right < panel.width + 24 ? 'left' : 'right'
  }

  // 向左时需要的空间：触发器左边缘再往左 PANEL_GAP
  const spaceNeededLeft = trigger.left - PANEL_GAP
  // 向右时需要的空间：触发器右边缘再往右 PANEL_GAP
  const spaceNeededRight = viewport.width - trigger.right - PANEL_GAP

  // ── 兜底：所选方向放不下时，改为在触发器下方就地展开 ──
  // 祖先已就地展开时，本级继承（否则就地展开的面板里的子级
  // 又会横向扩张，层级一深照样越界）
  let overlay: boolean
  if (inheritedOverlay) {
    overlay = true
  } else if (dir === 'left') {
    overlay = spaceNeededLeft < panel.width
  } else {
    overlay = spaceNeededRight < panel.width
  }

  // ── 垂直方向 ──
  // 默认与按钮顶端对齐（-13px 抵消一级面板的 padding）
  let top = trigger.top - PANEL_GAP
  if (top + panel.height > viewport.height - VIEWPORT_MARGIN) {
    top = Math.max(VIEWPORT_MARGIN, viewport.height - panel.height - VIEWPORT_MARGIN)
  }
  if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN

  // 就地展开时，下方空间够就向下，否则向上
  const spaceBelow = viewport.height - (trigger.top + 24)
  const spaceAbove = trigger.top - 24
  const overlayBelow = spaceBelow >= panel.height || spaceBelow >= spaceAbove

  return {
    dir,
    flip: dir === 'left',
    // 换算成相对触发器容器的偏移
    top: top - trigger.top,
    overlay,
    overlayBelow,
  }
}

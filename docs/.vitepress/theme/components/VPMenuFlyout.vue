<script lang="ts" setup>
/**
 * 面板内的级联分组（子分组的二级浮层面板）。
 *
 * 默认主题的下拉菜单里，分组只是一行静态标题（VPMenuGroup 的 <p class="title">），
 * 子项直接铺在同一个面板里，无法再往下分。
 * 这里把子分组改成「标题 + ⌄ 箭头」的按钮，悬停时在右侧弹出二级面板，
 * 与顶栏「操作系统」的下拉行为完全一致，于是嵌套分组可以层层展开。
 *
 * 面板用 position: absolute 定位在触发项右侧；靠近屏幕右边缘时自动翻转到左侧。
 *
 * 注意：本组件不 import VPMenu —— 两者互相 import 会在 SSR 阶段造成循环依赖。
 * 子项在这里自行渲染（链接用 VPMenuLink，分组递归调用自身）。
 */
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, type Ref } from 'vue'
import { useData } from 'vitepress'
import { isActive } from 'vitepress/dist/client/shared.js'
import VPMenuLink from 'vitepress/dist/client/theme-default/components/VPMenuLink.vue'
import { resolveCascade, type CascadeDir } from '../cascade'

/** provide/inject 的键：级联展开方向 */
const CASCADE_KEY = 'vpmenu-cascade-direction'

/** provide/inject 的键：是否退化为就地展开 */
const OVERLAY_KEY = 'vpmenu-cascade-overlay'

defineOptions({ name: 'VPMenuFlyout' })

const props = defineProps<{
  text?: string
  items: any[]
}>()

const { page } = useData()

const open = ref(false)
const flip = ref(false)
const overlay = ref(false)
const overlayBelow = ref(true)
const trigger = ref<HTMLElement>()
const panel = ref<HTMLElement>()

/** 面板的垂直位置（相对触发器的偏移，运行时按视口高度调整） */
const panelTop = ref(-13)

/** 延时关闭的定时器 */
let closeTimer: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer)
  window.removeEventListener('resize', reposition)
  observer?.disconnect()
})

/**
 * 视口尺寸变化时重新定位。
 * 面板展开后用户调整窗口大小（或浏览器缩放 / 系统字号变化），
 * 原本算好的方向与位置可能让面板超出屏幕，必须重算。
 */
function reposition() {
  if (open.value) checkFlip()
}

/** 观察触发器尺寸变化：容器被撑开/压缩时同样需要重算 */
let observer: ResizeObserver | null = null

/**
 * 调试开关：访问 ?cascade-debug 时在分组标题后显示定位计算结果，
 * 便于排查「面板跑到哪去了 / 哪一项被挡住」。
 */
const debug = ref(false)

const debugInfo = computed(() => {
  if (!debug.value) return ''
  const r = trigger.value?.getBoundingClientRect()
  const p = panel.value
  return (
    `${ownDir.value}${overlay.value ? '·就地' : ''}` +
    ` r=${Math.round(r?.right ?? -1)}` +
    ` vw=${typeof window !== 'undefined' ? window.innerWidth : -1}` +
    ` pw=${p?.offsetWidth ?? -1}` +
    ` disp=${p ? getComputedStyle(p).display : '-'}`
  )
})

onMounted(() => {
  window.addEventListener('resize', reposition)
  debug.value =
    typeof location !== 'undefined' &&
    new URLSearchParams(location.search).has('cascade-debug')
  if (trigger.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(reposition)
    observer.observe(trigger.value)
  }
})

/** 递归判断某个子项（含其后代）当前是否处于激活态 */
function isItemActive(item: any): boolean {
  if (!item || typeof item !== 'object') return false

  if ('link' in item) {
    return isActive(
      page.value.relativePath,
      item.activeMatch || item.link,
      !!item.activeMatch
    )
  }

  if ('items' in item) {
    if (item.items.some((child: any) => isItemActive(child))) return true
    if (item.activeMatch) {
      return isActive(page.value.relativePath, item.activeMatch, true)
    }
  }

  return false
}

/** 本分组是否激活（其子树内有当前页） */
const groupActive = computed(() => props.items.some(item => isItemActive(item)))

// ── 级联展开方向 ──
// 祖先面板一旦决定向左，后续层级全部沿用同一方向。
// 若每层各自判断，层级一深就会出现「向右→向左→向右」的锯齿式扩张，
// 面板宽度层层累加，最终超出视口。
// 同理，一旦某层退化为「就地展开」，后代也保持就地展开。

/** 祖先已决定的方向；没有祖先则为 null，由本级按可用空间自行判断 */
const inheritedDir = inject<Ref<CascadeDir> | null>(CASCADE_KEY, null)

/** 祖先是否已退化为就地展开 */
const inheritedOverlay = inject<Ref<boolean> | null>(OVERLAY_KEY, null)

/** 本级决定的方向，供后代继承 */
const ownDir = ref<CascadeDir>('right')
provide(CASCADE_KEY, ownDir)

/** 本级是否就地展开，供后代继承 */
const ownOverlay = ref(false)
provide(OVERLAY_KEY, ownOverlay)

function openPanel() {
  // 取消待执行的关闭（鼠标刚从间隙或其他元素移入面板）
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  open.value = true
  nextTick(checkFlip)
}

function closePanel() {
  // 延时关闭：鼠标横向移动时会短暂掠过按钮与面板之间的间隙，
  // 那一刻命中的不是本组件的后代，会立刻触发 mouseleave。
  // 延时后若鼠标尚未进入面板才真正关闭，避免「还没来得及点就消失」。
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    open.value = false
    closeTimer = null
  }, 200)
}

/**
 * 面板定位：
 *  · 水平方向 —— 祖先已向左则保持向左，否则右侧空间不足时改为向左；
 *    左右都放不下时改为覆盖式展开，保证不溢出视口
 *  · 垂直方向 —— 超出视口下沿时上移，超出上沿时下移
 *
 * 具体算法见 ../cascade.ts（抽成纯函数是为了能独立测试）。
 */
/** 面板宽度测不到时的重试次数（面板刚显示时布局可能还没稳定） */
let flipRetries = 0

function checkFlip() {
  const t = trigger.value
  const p = panel.value
  if (!t || !p) return

  // 面板刚显示的那一帧可能还量不到宽度，等下一帧再试
  if (p.offsetWidth === 0 && flipRetries < 5) {
    flipRetries++
    requestAnimationFrame(checkFlip)
    return
  }
  flipRetries = 0

  const r = t.getBoundingClientRect()
  const result = resolveCascade({
    trigger: { top: r.top, left: r.left, right: r.right },
    panel: { width: p.offsetWidth, height: p.offsetHeight },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    inheritedDir: inheritedDir?.value ?? null,
    inheritedOverlay: inheritedOverlay?.value ?? false,
  })

  ownDir.value = result.dir
  flip.value = result.flip
  overlay.value = result.overlay
  overlayBelow.value = result.overlayBelow
  ownOverlay.value = result.overlay
  panelTop.value = result.top
}
</script>

<template>
  <div
    class="VPFlyout VPMenuFlyout"
    :class="{ open, flip, overlay, 'overlay-below': overlayBelow, active: groupActive }"
    @mouseenter="openPanel"
    @mouseleave="closePanel"
  >
    <button
      ref="trigger"
      type="button"
      class="button"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="text">
        {{ text }}
        <span class="vpi-chevron-down text-icon" />
      </span>
      <span v-if="debug" class="debug-flag">{{ debugInfo }}</span>
    </button>

    <!-- 就地展开时由 CSS 决定上下位置，不设内联 top -->
    <div
      v-show="open"
      ref="panel"
      class="menu"
      :style="overlay ? undefined : { top: panelTop + 'px' }"
    >
      <div class="VPMenu">
        <div class="items">
          <template v-for="item in items" :key="JSON.stringify(item)">
            <VPMenuLink v-if="'link' in item" :item="item" />
            <!-- 更深一层：继续递归出三级、四级……面板 -->
            <VPMenuFlyout v-else :text="item.text" :items="item.items" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./menu.css"></style>

<style scoped>
.VPMenuFlyout {
  position: relative;
}

.button {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  padding: 0 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  /* 极窄视口下允许换行，避免文字溢出面板 */
  white-space: normal;
  overflow-wrap: anywhere;
  transition: color 0.25s;
}

.button:hover {
  color: var(--vp-c-brand-1);
}

.active > .button {
  color: var(--vp-c-brand-1);
}

.text {
  display: flex;
  align-items: center;
}

.text-icon {
  margin-left: 4px;
  font-size: 12px;
}

/* 调试徽标：仅在 ?cascade-debug 下显示 */
.debug-flag {
  margin-left: 8px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 11px;
  font-weight: 400;
  line-height: 18px;
  white-space: nowrap;
}

/* 二级面板：默认向右弹出。
   偏移 13px = 一级面板的 padding(12px) + border(1px)，
   让二级面板紧贴一级面板的右边缘（而非压住它的边框）。
   width: max-content 必不可少——绝对定位 + left:100% 会让可用宽度归零，
   shrink-to-fit 于是退化成 min-content，文字会被压成竖排一行一个字。
   垂直位置由 JS 按视口高度计算，通过内联 style 覆盖这里的默认值。 */
.menu {
  position: absolute;
  top: -13px;
  left: 100%;
  margin-left: 13px;
  width: max-content;
  min-width: 160px;
  max-width: calc(100vw - 24px);
  z-index: 1;
}

/* 右侧空间不足时改为向左弹出 */
.flip .menu {
  left: auto;
  right: 100%;
  margin-left: 0;
  margin-right: 13px;
}

/* 左右都放不下时的兜底：改为在当前面板内**流式**展开（向下撑开），
   而不是绝对定位覆盖——绝对定位会把父面板下方的条目挡住，
   看起来就像「其他项都不见了」。 */
.overlay .menu {
  position: relative;
  left: 0;
  right: auto;
  top: 0;
  width: auto;
  margin: 4px 0 0;
  z-index: 1;
}

/* 空间不足时改为向上流式展开 */
.overlay.overlay-above .menu {
  margin: 0 0 4px;
}

/* 「桥梁」：鼠标从按钮横向移向面板时会掠过两者之间的间隙，
   那一刻命中的不是本组件的后代，会立刻触发 mouseleave 导致面板消失。
   用一条透明区域盖住间隙，让 hover 不中断。 */
.VPMenuFlyout::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 100%;
  width: 14px;
}

.flip .VPMenuFlyout::after {
  left: auto;
  right: 100%;
}
</style>

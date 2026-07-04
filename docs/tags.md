---
title: 分类大厅
layout: page
---

# 🛠️ 软件分类大厅

<script setup>
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'
import { data as allArticles } from './articles.data'

// ==========================================
// ⚙️ 【通用配置中心】 以后改这里就行
// ==========================================

// 1. 指定捞取的文章路径范围（由于增加了智能基础路径剔除，这里写真实文件夹名即可）
const ALLOWED_PATHS = ['SoftShare']

// 2. 定义你想筛选的 Frontmatter 标签维度（对应你文章顶部的键名）
const FILTER_DIMENSIONS = [
  { label: '适用系统：', key: 'os' },
  { label: '软件类型：', key: 'category' }
]

// 3. 定义每个标签维度允许的可选值
const DIMENSION_VALUES = {
  os: ['Windows', 'Linux', 'macOS'],
  category: ['Development', 'Utility', 'Office', 'Game', 'Network', 'Graphics', 'System', 'Media']
}

// ==========================================
// 核心逻辑与算法
// ==========================================

// 安全初始化响应式状态
const selectedFilters = ref({})
FILTER_DIMENSIONS.forEach(dim => {
  selectedFilters.value[dim.key] = 'all'
})

// 核心算法：通用多维动态过滤
const filteredNotes = computed(() => {
  if (!allArticles || !Array.isArray(allArticles)) return []

  return allArticles.filter(p => {
    // 排除 index.md 导航页
    if (p.isIndex) return false

    // 过滤一：路径范围校验（只显示 SoftShare 等目标目录下的文章）
    const isInRange = ALLOWED_PATHS.some(prefix => p.sectionDir === prefix)
    if (!isInRange) return false

    // 过滤二：动态多维标签校验
    return FILTER_DIMENSIONS.every(dim => {
      const currentSelectedValue = selectedFilters.value[dim.key] || 'all'

      // 如果当前维度选的是 'all'（全部），直接放行
      if (currentSelectedValue === 'all') return true

      // 不管 Frontmatter 里存的是什么格式，一律强行转为”去空格纯字符串数组”
      const rawValue = p.frontmatter[dim.key]
      let noteValues = []

      if (Array.isArray(rawValue)) {
        noteValues = rawValue.map((v) => String(v).trim())
      } else if (rawValue) {
        noteValues = String(rawValue).split(',').map(v => v.trim())
      }

      // 忽略大小写进行严格匹配
      return noteValues.some(val => val.toLowerCase() === currentSelectedValue.toLowerCase())
    })
  })
})

// 获取某个维度的按钮列表（自动在最前面拼接一个 'all'）
const getButtonsForDimension = (key) => {
  return ['all', ...(DIMENSION_VALUES[key] || [])]
}
</script>

<div class="filter-panel">
  <div v-for="dim in FILTER_DIMENSIONS" :key="dim.key" class="filter-row">
    <span class="filter-label">{{ dim.label }}</span>
    <div class="filter-buttons">
      <button 
        v-for="val in getButtonsForDimension(dim.key)" 
        :key="val"
        :class="{ active: selectedFilters[dim.key] === val }"
        @click="selectedFilters[dim.key] = val"
      >
        {{ val === 'all' ? '全部' : val }}
      </button>
    </div>
  </div>
</div>

<hr class="divider">

<div class="notes-grid">
  <div v-if="filteredNotes.length === 0" class="no-data">
    没有找到满足当前筛选条件的软件笔记
  </div>
  
  <a v-for="note in filteredNotes" :key="note.url" :href="withBase(note.url)" class="note-card">
    <div class="card-content">
      <h3 class="card-title">{{ note.frontmatter.title || note.title }}</h3>
      <p v-if="note.frontmatter.description" class="card-desc">
        {{ note.frontmatter.description }}
      </p>
    </div>

  <div class="card-badges">
      <div v-for="dim in FILTER_DIMENSIONS" :key="dim.key" class="badge-group">
        <template v-if="note.frontmatter && note.frontmatter[dim.key]">
          <span 
            v-for="badgeVal in (Array.isArray(note.frontmatter[dim.key]) ? note.frontmatter[dim.key] : [note.frontmatter[dim.key]])" 
            :key="badgeVal" 
            class="badge" 
            :class="dim.key + '-badge'"
          >
            {{ String(badgeVal).trim() }}
          </span>
        </template>
      </div>
    </div>
  </a>
</div>

<style scoped>
.filter-panel {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-gutter);
  padding: 18px;
  border-radius: 12px;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.filter-row {
  display: flex;
  align-items: center;
}
.filter-label {
  font-weight: bold;
  min-width: 80px;
  color: var(--vp-c-text-1);
}
.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-buttons button {
  padding: 4px 14px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  background: transparent;
  color: var(--vp-c-brand-1);
  transition: all 0.2s ease;
}
.filter-buttons button:hover, .filter-buttons button.active {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
}
.divider {
  margin: 25px 0;
  border-color: var(--vp-c-gutter);
}
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.no-data {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--vp-c-text-2);
}
.note-card {
  border: 1px solid var(--vp-c-gutter);
  background-color: var(--vp-c-bg-elv);
  padding: 16px;
  border-radius: 10px;
  text-decoration: none !important;
  color: inherit !important;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 130px;
  transition: all 0.25s ease;
}
.note-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.card-title {
  margin: 0 0 6px 0 !important;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.card-desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin: 0 0 12px 0;
  line-height: 1.4;
}
.card-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
}
.badge-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.badge {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
}
.os-badge {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.category-badge {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-gutter);
}
</style>
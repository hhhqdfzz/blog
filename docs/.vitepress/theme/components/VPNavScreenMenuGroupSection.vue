<script lang="ts" setup>
/**
 * 递归版移动端分组（替换 VitePress 默认主题的 VPNavScreenMenuGroupSection）。
 *
 * 默认实现只渲染带 `link` 的子项，嵌套分组会被丢弃；这里改为递归渲染，
 * 使配置里写几层就渲染几层，与桌面端行为保持一致。
 *
 * 实现思路：每一级分组都交给主题原生的 VPNavScreenMenuGroup 渲染——
 * 它自带「+」折叠按钮，所以移动端**每一层都能独立折叠**；
 * 而它内部遇到嵌套分组时又会回调本组件，于是递归自然成立。
 *
 * 缩进规则：每一级分组容器统一缩进一级（margin-left + 竖线）。
 * 原生链接自带 margin-left: 12px，正好构成「分组标题 → 其子项」的一级缩进，
 * 于是标题、折叠按钮、普通链接在每一层上的缩进完全一致。
 */
import VPNavScreenMenuGroup from 'vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue'
import VPNavScreenMenuGroupLink from 'vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupLink.vue'

defineOptions({ name: 'VPNavScreenMenuGroupSection' })

defineProps<{
  text?: string
  items: any[]
}>()
</script>

<template>
  <div class="VPNavScreenMenuGroupSection">
    <!-- 有标题：整组交给原生折叠分组（自带「+」按钮），
         其内部再遇到分组时会回调本组件，形成递归 -->
    <VPNavScreenMenuGroup v-if="text" :text="text" :items="items" />

    <!-- 无标题：直接列出链接 -->
    <template v-else>
      <VPNavScreenMenuGroupLink
        v-for="item in items"
        :key="JSON.stringify(item)"
        :item="item"
      />
    </template>
  </div>
</template>

<style scoped>
/* 每一级分组容器统一缩进一级 + 竖线标示层级。
   注意不要加 padding-left：原生链接自带 margin-left: 12px，
   那个缩进正好表示「比所在分组的标题深一级」；
   若分组容器再加 padding，两套缩进基准会错开，
   表现为「分组标题与它的子项看起来同级」。 */
.VPNavScreenMenuGroupSection {
  display: block;
  margin-left: 12px;
  border-left: 1px solid var(--vp-c-divider);
}
</style>

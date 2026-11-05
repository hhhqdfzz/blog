<script lang="ts" setup>
/**
 * 菜单容器（替换 VitePress 默认主题的 VPMenu）。
 *
 * 相对默认实现的一处改动：分组不再渲染成静态标题行，而是渲染成
 * VPMenuFlyout —— 悬停时弹出二级面板，与顶栏下拉的行为一致，
 * 从而支持任意层级的嵌套。
 *
 * 面板容器样式见同目录的 menu.css（与级联子面板共用）。
 */
import VPMenuLink from 'vitepress/dist/client/theme-default/components/VPMenuLink.vue'
import VPMenuFlyout from './VPMenuFlyout.vue'

defineProps<{
  items?: any[]
}>()
</script>

<template>
  <div class="VPMenu">
    <div v-if="items" class="items">
      <template v-for="item in items" :key="JSON.stringify(item)">
        <VPMenuLink v-if="'link' in item" :item="item" />
        <component
          v-else-if="'component' in item"
          :is="item.component"
          v-bind="item.props"
        />
        <!-- 分组：可悬停展开二级面板 -->
        <VPMenuFlyout v-else :text="item.text" :items="item.items" />
      </template>
    </div>

    <slot />
  </div>
</template>

<style src="./menu.css"></style>

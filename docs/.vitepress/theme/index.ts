import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'
// 引入刚刚写好的事件监听与样式注入组件
import MermaidToolbar from './components/MermaidToolbar.vue' 

export default {
  extends: DefaultTheme,
  Layout() {
    // 将该组件以无侵入的方式挂载在 Layout 底部执行
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(MermaidToolbar)
    })
  }
}

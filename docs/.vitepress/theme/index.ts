import DefaultTheme from 'vitepress/theme'
import DocFooter from './DocFooter.vue'
import Layout from './Layout.vue'
import type { Theme } from 'vitepress'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
} satisfies Theme

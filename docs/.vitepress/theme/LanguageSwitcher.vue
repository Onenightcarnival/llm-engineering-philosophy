<script setup>
import { computed } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { zhToEn, enToZh } from '../locale-links'

const { lang, site } = useData()
const route = useRoute()

const isEnglish = computed(() => lang.value === 'en')

const targetLink = computed(() => {
  // route.path includes base prefix and .html suffix, e.g.
  // "/llm-engineering-philosophy/en/chapters/.../04-xxx.html"
  // Strip base prefix, .html, trailing slash to get clean path
  const base = site.value.base || '/'
  let path = decodeURIComponent(route.path)
  if (base !== '/' && path.startsWith(base)) {
    path = path.slice(base.length - 1) // keep leading /
  }
  path = path
    .replace(/\.html$/, '')
    .replace(/\/index$/, '')
    .replace(/\/$/, '') || '/'

  if (isEnglish.value) {
    return withBase(enToZh[path] || '/')
  } else {
    return withBase(zhToEn[path] || '/en/')
  }
})

const targetLabel = computed(() => isEnglish.value ? '中文' : 'English')
const currentLabel = computed(() => isEnglish.value ? 'English' : '中文')
</script>

<template>
  <div class="lang-switcher">
    <button class="lang-button" aria-label="Change language">
      <span class="current">{{ currentLabel }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <div class="lang-menu">
        <div class="lang-menu-item current-lang">{{ currentLabel }}</div>
        <a class="lang-menu-item" :href="targetLink">{{ targetLabel }}</a>
      </div>
    </button>
  </div>
</template>

<style scoped>
.lang-switcher {
  position: relative;
  margin-left: 8px;
}

.lang-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  height: 36px;
  border: none;
  background: none;
  color: var(--vp-c-text-2);
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.25s;
}

.lang-button:hover {
  color: var(--vp-c-text-1);
}

.lang-menu {
  display: none;
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 100px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.lang-button:hover .lang-menu,
.lang-button:focus-within .lang-menu {
  display: block;
}

.lang-menu-item {
  display: block;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  text-decoration: none;
  white-space: nowrap;
}

.lang-menu-item:hover {
  background: var(--vp-c-bg-soft);
}

.lang-menu-item.current-lang {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}
</style>

<script setup>
import DefaultTheme from 'vitepress/theme'
import DocFooter from './DocFooter.vue'
import TranslationNotice from './TranslationNotice.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <LanguageSwitcher />
    </template>
    <template #doc-before>
      <TranslationNotice />
    </template>
    <template #doc-after>
      <DocFooter />
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import DocFooter from './DocFooter.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-after>
      <DocFooter />
    </template>
  </Layout>
</template>

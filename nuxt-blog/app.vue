<template>
  <div id="app">
    <NuxtPage />
  </div>
</template>

<script setup>
// Global head configuration
useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>
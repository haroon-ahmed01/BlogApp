export default defineNuxtConfig({
  compatibilityDate: '2025-07-13',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      baseURL: 'http://localhost:3000',
      apiURL: 'http://localhost:5001/api'
    }
  },
  nitro: {
    experimental: {
      wasm: true
    }
  }
})
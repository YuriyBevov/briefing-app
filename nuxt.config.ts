export default defineNuxtConfig({
  compatibilityDate: '2026-08-21',
  devtools: { enabled: true },
  srcDir: 'app',
  css: ['~/assets/styles/main.scss'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'ru'
      },
      title: 'Brief OS',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        }
      ]
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
  }
})

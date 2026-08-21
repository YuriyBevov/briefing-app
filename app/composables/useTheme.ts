type ThemeName = 'dark' | 'light'

const theme = ref<ThemeName>('dark')

export const useTheme = () => {
  const setTheme = (value: ThemeName) => {
    theme.value = value

    if (import.meta.client) {
      document.documentElement.dataset.theme = value
      window.localStorage.setItem('brief-os-theme', value)
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    const savedTheme = window.localStorage.getItem('brief-os-theme')

    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme)
      return
    }

    setTheme('dark')
  })

  return {
    theme,
    setTheme,
    toggleTheme
  }
}

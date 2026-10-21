/**
 * Tema (Cap. 11 — PWA com modo escuro).
 * O padrão da marca é Midnight (dark). O usuário pode alternar para claro.
 */
import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'prisma:theme'
const theme = ref(readInitial())

function readInitial() {
  if (typeof window === 'undefined') return 'dark'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return 'dark'
}

export function useTheme() {
  watchEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = theme.value
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme.value === 'dark' ? '#05091A' : '#F6F7FC')
    window.localStorage.setItem(STORAGE_KEY, theme.value)
  })

  const toggle = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggle }
}

import { create } from 'zustand'

export const THEME_STORAGE_KEY = 'wa-fuel-theme' as const

export type Theme = 'light' | 'dark'

function readStoredTheme(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY)
    if (t === 'dark' || t === 'light') return t
  } catch {
    /* ignore */
  }
  return null
}

function applyDomTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
}

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',

  setTheme: (theme) => {
    applyDomTheme(theme)
    persistTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
}))

/** Sync Zustand from DOM + localStorage (call before React root; matches inline script). */
export function initThemeFromStorage(): void {
  const stored = readStoredTheme()
  const fromDom = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  const theme = stored ?? fromDom
  applyDomTheme(theme)
  useThemeStore.setState({ theme })
}

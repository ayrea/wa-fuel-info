import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync } from 'fs'
import { resolve } from 'path'

function dataManifestPlugin() {
  const virtualModuleId = 'virtual:data-manifest'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'data-manifest',
    resolveId(id: string) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const dataDir = resolve(__dirname, 'public/data')
        try {
          const files = readdirSync(dataDir)
            .filter((f) => f.endsWith('.json') && /^\d{4}-\d{2}-\d{2}_\w+\.json$/.test(f))
            .sort()
          return `export const dataFiles = ${JSON.stringify(files)};`
        } catch {
          return `export const dataFiles = [];`
        }
      }
    },
  }
}

export default defineConfig({
  base: '/wa-fuel-info/',
  plugins: [react(), tailwindcss(), dataManifestPlugin()],
})

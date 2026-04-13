import { copyFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = join(__dirname, '..', 'dist')
const indexHtml = join(dist, 'index.html')
const notFoundHtml = join(dist, '404.html')

if (!existsSync(indexHtml)) {
  console.error('copy-spa-404: dist/index.html not found; run vite build first.')
  process.exit(1)
}

copyFileSync(indexHtml, notFoundHtml)
console.log('copy-spa-404: wrote dist/404.html')

import path from 'path'
import { fileURLToPath } from 'url'
import { createApp } from './app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(rootDir, 'data')
const port = Number(process.env.PORT) || 3001

async function main() {
  const app = await createApp(dataDir)
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
    console.log(`Data directory: ${dataDir}`)
  })
}

main().catch(console.error)

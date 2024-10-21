import { readdirSync, existsSync } from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const registerRoutes = function (fastify, dir) {

const __dirname = dirname(fileURLToPath(import.meta.url))
const routesPath = path.join(__dirname, dir)

  readdirSync(routesPath).forEach(folderName => {
      let fullPath = path.join(routesPath, folderName, 'routes.js')
      if (!existsSync(fullPath)) return

      const module = import("file://" + fullPath)
      fastify.register(module, { prefix: `api/${folderName}` })
    })
}

export default registerRoutes
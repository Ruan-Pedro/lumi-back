import getAll from './handlers/get-all.js'
import extract from './handlers/extract.js'
import downloadFile from './handlers/download-pdf.js'

async function routes(fastify) {
  fastify.get('/', {config: {requiresAuth: true}}, getAll)
  fastify.post('/', {config: {requiresAuth: true}}, extract)
  fastify.post('/download/:filename', {config: {requiresAuth: true}}, downloadFile)
}

export default routes
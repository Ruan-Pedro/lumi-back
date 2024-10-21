import fs from 'fs'
import path from 'path'

const downloadFile = async function (request, reply) {
  try {
    const token = request.headers.authorization
    if (!token) return reply.code(401).send()

    const { filename } = request.params
    if (!filename) return reply.code(400).send('Nome do arquivo não especificado')

    const __dirname = path.dirname(new URL(import.meta.url).pathname)
    const uploadsPath = path.join(__dirname, '../../../uploads', filename)
    if (!fs.existsSync(uploadsPath)) return reply.code(404).send('Arquivo não encontrado')

    reply.header('Content-Type', 'application/pdf')
    reply.header('Content-Disposition', `attachment; filename="${filename}"`)

    const fileStream = fs.createReadStream(uploadsPath)
    fileStream.pipe(reply.raw)
  } catch (error) {
    console.error(error)
    return reply.code(500).send('Não foi possível realizar o download do arquivo.')
  }
}

export default downloadFile

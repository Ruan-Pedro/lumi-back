import { cacheClient } from '../../../index.js'
import extract from '../business-rules/extract.js'

const extractHandler = async function (request, reply) {
  const token = request.headers.authorization
  const file = await request.file()

  try {
    const result = await extract(file, token, this.dbConnection)

    const cacheKeys = await cacheClient.keys('cache:faturas:*')
    if (cacheKeys.length > 0) await cacheClient.del(cacheKeys)

    return reply.code(200).send(result)
  } catch (error) {
    console.error(error)
    return reply.code(500).send(error.message)
  }
}

export default extractHandler

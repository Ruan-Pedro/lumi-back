import getAll from '../business-rules/get-all.js'

const getAllHandler = async function (request, reply) {
  const token = request.headers.authorization

  try {
    const data = await getAll(request.query, token, this.dbConnection)
    return reply.code(200).send(data)
  } catch (error) {
    return reply.code(error.code).send(error.message)
  }
}

export default getAllHandler
// export default async function (request, reply) {
//     try {
//       const requiresAuth = request.routeConfig.requiresAuth
//       if (!requiresAuth) return null
  
//       const token = request.headers.authorization
//       if (!token) return reply.code(401).send()
  
//       const accessData = await this
//         .dbConnection('IntegracaoToken')
//         .where({ Token: token })
//         .first()
  
//       if (!accessData || !Object.keys(accessData).length) return reply.code(401).send()
  
//       const tokenIsValid = accessData.Token.toString() === token.toString()
  
//       if (!tokenIsValid) return reply.code(401).send()
//     } catch (e) {
//       console.log(e)
//       reply.code(500).send('Can\'t validate.')
//     }
//   }
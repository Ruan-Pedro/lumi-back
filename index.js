import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifyFormbody from '@fastify/formbody'
import FastifyStatic from '@fastify/static'
import dbConnector from './db-connector.js'
import Dotenv from 'dotenv'
import registerRoutes from './register-routes.js'
import { createClient } from 'redis'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'
Dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envToLogger = {
    development: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            }
        }
    },
    production: {
        redact: {
            paths: ['pid', 'hostname', 'level', 'reqId', 'req.headers.authorization'],
            remove: true
        },
        serializers: {
            req(request) {
                return {
                    method: request.method,
                    url: request.url
                    // headers: request.headers,
                    // hostname: request.hostname,
                    // remoteAddress: request.ip,
                    // remotePort: request.socket.remotePort
                }
            }
        }
    },
    test: true
}

let cacheClient

const build = async (opts = {}) => {
    const fastify = Fastify({ logger: envToLogger[process.env.ENVIRONMENT || 'production'] ?? true })
    // const start = async function () {
        try {
            const dbConnection = dbConnector()
            if (!dbConnection) return

            cacheClient = createClient({ url: `redis://${process.env.REDISURL}:${process.env.REDISPORT}` })

            await Promise.all([
                cacheClient.connect()
            ])

            fastify.register(fastifyCors, {})
            const uploadsPath = path.join(__dirname, './uploads')
            fastify.register(FastifyStatic, {
                root: uploadsPath,
                prefix: '/uploads/'
            })
            fastify.register(fastifyMultipart, {
                addToBody: true
            })
            fastify.register(fastifyFormbody)
            fastify.register(import('@fastify/rate-limit'), {
                max: 100000,
                timeWindow: '1000 minutes'
            })

            fastify.decorate('dbConnection', dbConnection)
            //   fastify.addHook('onRequest', hooks.onRequest)
            fastify.get('/', (_, reply) => reply.send('Everything is fine :)'))

            registerRoutes(fastify, './modules')

            fastify.listen({ port: process.env.PORT || 3201, host: '0.0.0.0', serverTimeout: 90000 })
            return fastify
        } catch (error) {
            fastify.log.info('caiu')
            fastify.log.error(error)
            process.exit(1)
        }
    // }
}

// start()
export { cacheClient }
export default build
'use strict'

import build from './index.js'

const start = async function () {
    const fastify = await build()
    try {
        fastify.listen({ port: process.env.PORT || 3201, host: '0.0.0.0', serverTimeout: 90000 })
    } catch (error) {
        fastify.log.info('caiu')
        fastify.log.error(error)
        console.error(error)
        process.exit(1)
    }
}

start()
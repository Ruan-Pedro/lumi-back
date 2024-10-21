import request from 'supertest'
import build from '../index.js'

describe('server should running correctly', () => {
    let app

    beforeAll(async () => {
        app = await build()
        await app.listen({ port: 0, host: '0.0.0.0', serverTimeout: 90000 })
    }, 20000)

    afterAll(async () => await app.server.close())

    test('should answer on root', async () => {
        const response = await request(app.server).get('/')
        expect(response.status).toBe(200)
        expect(response.text).toBe("Everything is fine :)")
    })
})
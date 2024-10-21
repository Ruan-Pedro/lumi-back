import request from 'supertest'
import build, { cacheClient } from '../index.js'
import path from 'path'
import { fileURLToPath } from 'url'
import dbConnector from '../db-connector.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('PDF Handler Tests', () => {
  let app
  let transaction

  beforeAll(async () => {
    app = await build()
    app.listen({ port:0, host: '0.0.0.0', serverTimeout: 90000 })
  })

  beforeEach(async function () {
    transaction = await dbConnector().transaction()
  })

  afterEach(async function () {
    await transaction.rollback()
  })

  afterAll(async function () {
    await app.close()
    await cacheClient.disconnect()
  })

  test('Parsing correto dos PDFs', async function () {
    const response = await request(app.server)
      .get('/api/pdf')
      .set('Content-Type', 'multipart/form-data')
      .set('Authorization', 'authlumi')

      const responseData = JSON.parse(response.text)
  
      expect(responseData).toHaveProperty('data')
      expect(responseData.data.length).toBeGreaterThan(0)
    
      responseData.data.forEach(item => {
        expect(Number.isInteger(parseInt(item.id, 10))).toBe(true)
        expect(typeof item.numerocliente).toBe('string')
        expect(typeof item.anoreferencia).toBe('number')
        expect(typeof item.energiaeletricaquantidade).toBe('number')
        expect(typeof item.energiasceeequantidade).toBe('number')
        expect(typeof item.energiaeletricavalor).toBe('number')
        expect(typeof item.energiasceeevalor).toBe('number')
        expect(typeof item.energiacompensadavalor).toBe('number')
        expect(typeof item.contribilumvalor).toBe('number')
        expect(typeof item.totalvalor).toBe('number')
        expect(typeof item.nomearquivo).toBe('string')
        expect(typeof item.numeroinstalacao).toBe('string')
        expect(typeof item.createdat).toBe('string')
      })
    
      expect(responseData).toHaveProperty('metadata')
      expect(typeof responseData.metadata.currentPage).toBe('number')
      expect(typeof responseData.metadata.totalPages).toBe('number')
      expect(typeof responseData.metadata.totalRecords).toBe('string')
  }, 10000)

  test('Inserção no banco e retorno pela API', async function () {
    const transaction = await dbConnector().transaction()

    try {
      const response = await request(app.server)
          .post('/api/pdf')
          .set('Content-Type', 'multipart/form-data')
          .set('Authorization', 'authlumi')
          .attach('file', path.join(__dirname, '../uploads/3001116735-01-2024.pdf'))

      expect(response.status).toBe(200)

      const insertedData = await dbConnector()('contaluz')
          .withSchema('LumiDB')
          .select('*')
          .where('nomearquivo', '3001116735-01-2024.pdf')
          .transacting(transaction)

      expect(insertedData[0].numerocliente).toBe('7204076116')
      expect(insertedData[0].anoreferencia).toBe(2024)  
      await transaction.rollback()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  })
})
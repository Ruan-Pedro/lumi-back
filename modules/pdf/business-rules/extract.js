import { PdfReader } from 'pdfreader'
import fs from 'fs-extra'
import path from 'path'
import { promisify } from '../../../utils/index.js'
const table = 'contaluz'

const extract = async (file, token, connection, externalTrx = null) => {
  return new Promise(async (resolve, reject) => {
    const trx = externalTrx || await promisify(connection.transaction.bind(connection))
    try {
      if (!token) return reject('Unauthorized')

      if (!file) return reject('Arquivo não enviado')

      const pdfBuffer = await file.toBuffer()
      if (!pdfBuffer || pdfBuffer.length === 0) return reject('O buffer do arquivo está vazio ou inválido')

      const __dirname = path.dirname(new URL(import.meta.url).pathname)
      const uploadsPath = path.join(__dirname, '../../../uploads')
      if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true })
      const filePath = path.join(uploadsPath, file.filename)
      fs.writeFileSync(filePath, pdfBuffer)

      const results = {
        cliente: null,
        mesReferencia: null,
        energiaEletrica: {
          quantidade: null,
          valor: null
        },
        energiaSCEEE: {
          quantidade: null,
          valor: null
        },
        energiaCompensada: {
          quantidade: null,
          valor: null
        },
        contribIlum: {
          valor: null
        },
        total: null
      }

      const lines = []
      let clienteIndex = null
      let mesReferenciaIndex = null
      let energiaSCEEEQntIndex = null
      let energiaSCEEEValIndex = null
      let enerEletrValIndex = null
      let enerEletrQntIndex = null
      let enerCompValIndex = null
      let enerCompQntIndex = null
      let contribIlumIndex = null
      let totalIndex = null

      await new Promise((resolveParser, rejectParser) => {
        new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
          if (err) {
            console.error('Erro ao analisar PDF:', err)
            rejectParser(err)
          } else if (!item) {
            resolveParser()
          } else if (item.text) {
            const text = item.text.trim()
            lines.push(text)

            if (text.includes('DO CLIENTE')) {
              clienteIndex = lines.length
            } else if (clienteIndex !== null && lines.length === clienteIndex + 1) {
              results.cliente = text.split(/\s+/)[0]
              clienteIndex = null
            }

            if (text.includes('Referente a')) {
              mesReferenciaIndex = lines.length
            } else if (mesReferenciaIndex !== null && lines.length === mesReferenciaIndex + 2) {
              results.mesReferencia = text.split(/\s+/)[0]
              mesReferenciaIndex = null
            }

            if (text.includes('Energia SCEE s/ ICMS')) {
              energiaSCEEEValIndex = lines.length
              energiaSCEEEQntIndex = lines.length
            } else if (energiaSCEEEValIndex !== null && lines.length === energiaSCEEEValIndex + 4) {
              results.energiaSCEEE.valor = text.split(/\s+/)[0]
              energiaSCEEEValIndex = null
            } else if (energiaSCEEEQntIndex !== null && lines.length === energiaSCEEEQntIndex + 2) {
              results.energiaSCEEE.quantidade = text.split(/\s+/)[0]
              energiaSCEEEQntIndex = null
            }

            if (text === 'Energia Elétrica') {
              enerEletrValIndex = lines.length
              enerEletrQntIndex = lines.length
            } else if (enerEletrValIndex !== null && lines.length === enerEletrValIndex + 4) {
              results.energiaEletrica.valor = text.split(/\s+/)[0]
              enerEletrValIndex = null
            } else if (enerEletrQntIndex !== null && lines.length === enerEletrQntIndex + 2) {
              results.energiaEletrica.quantidade = text.split(/\s+/)[0]
              enerEletrQntIndex = null
            }

            if (text === 'Energia compensada GD I') {
              enerCompValIndex = lines.length
              enerCompQntIndex = lines.length
            } else if (enerCompValIndex !== null && lines.length === enerCompValIndex + 4) {
              results.energiaCompensada.valor = text.split(/\s+/)[0]
              enerCompValIndex = null
            } else if (enerCompQntIndex !== null && lines.length === enerCompQntIndex + 2) {
              results.energiaCompensada.quantidade = text.split(/\s+/)[0]
              enerCompQntIndex = null
            }

            if (text === 'Contrib Ilum Publica Municipal') {
              contribIlumIndex = lines.length
            } else if (contribIlumIndex !== null && lines.length === contribIlumIndex + 1) {
              results.contribIlum.valor = text.split(/\s+/)[0]
              contribIlumIndex = null
            }

            if (text === 'TOTAL') {
              totalIndex = lines.length
            } else if (totalIndex !== null && lines.length === totalIndex + 1) {
              results.total = text.split(/\s+/)[0]
              totalIndex = null
            }
          }
        })
      })

      const toUpdateObsPromise = []
      const toInsert = trx(table)
        .insert({
          numerocliente: results.cliente,
          mesreferencia: results.mesReferencia.split('/')[0],
          anoreferencia: results.mesReferencia.split('/')[1],
          energiaeletricaquantidade: results.energiaEletrica.quantidade,
          energiaeletricavalor: results.energiaEletrica.valor.toString().replace(',', '.'),
          energiasceeequantidade: results.energiaSCEEE.quantidade,
          energiasceeevalor: results.energiaSCEEE.valor.toString().replace(',', '.'),
          energiacompensadaquantidade: results.energiaCompensada.quantidade,
          energiacompensadavalor: results.energiaCompensada.valor.toString().replace(',', '.'),
          contribilumvalor: results.contribIlum.valor.toString().replace(',', '.'),
          totalvalor: results.total.toString().replace(',', '.'),
          nomearquivo: file.filename,
          numeroinstalacao: file.filename.split('-')[0]
        })
      toUpdateObsPromise.push(toInsert)
      await Promise.all([...toUpdateObsPromise]).then(trx.commit).catch(trx.rollback)

      resolve({
        msg: 'Conta de Luz Cadastrada',
        data: results
      })
    } catch (error) {
      console.error(error)
      await trx.rollback()
      reject('Não foi possível recuperar os resultados.')
    }
  })
}

export default extract

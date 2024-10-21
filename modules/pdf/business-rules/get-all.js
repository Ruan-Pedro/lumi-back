import { cacheClient } from '../../../index.js'
import queryPagination from '../../../utils/query-pagination.js'
const table = 'contaluz'

const getAll = async (filter, token, connection) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!token) return reject({ code: 401, message: 'Unauthorized' })

      const countData = await connection(table).count('id as total')
      const totalRecords = countData[0].total
      if (!totalRecords) return reject({ code: 204 })

      const cacheKey = `cache:faturas:page=${filter.page}&limit=${filter.limit}&cliente=${filter.cliente}&mesReferencia=${filter.mesReferencia}&anoReferencia=${filter.anoReferencia}`
      const cachedData = await cacheClient.get(cacheKey)
      if (cachedData) return resolve(JSON.parse(cachedData))

      const {
        paginationPage,
        paginationLimit,
        paginationOffset,
        paginationTotalPages
      } = queryPagination(filter.limit, filter.page, totalRecords)

      if (paginationPage > paginationTotalPages) return reject({ code: 204 })

      const filterFunction = (builder) => {
        builder.where({})
        if (filter.cliente) {
          builder.andWhere('numerocliente', filter.cliente)
        }
        if (filter.mesReferencia) {
          builder.andWhere('mesreferencia', filter.mesReferencia)
        }
        if (filter.anoReferencia) {
          builder.andWhere('anoreferencia', filter.anoReferencia)
        }
      }

      const data = await connection(table)
        .select('*')
        .modify(filterFunction)
        .limit(paginationLimit)
        .offset(paginationOffset)

      if (!data || !data.length) return reject({ code: 400, message: 'Não Há Faturas Salvas' })

      const result = {
        data,
        metadata: {
          currentPage: paginationPage,
          totalPages: paginationTotalPages,
          totalRecords
        }
      }
      await cacheClient.setEx(cacheKey, 604800, JSON.stringify(result))
      resolve(result)
    } catch (error) {
      console.error(error)
      reject({ code: 500, message: 'Não foi possível recuperar os resultados.' })
    }
  })
}

export default getAll

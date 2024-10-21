import Crypto from 'crypto'

const sliceArrayIntoChunks = (arr, chunkSize) => {
  const res = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    res.push(chunk)
  }
  return res
}

const generateTokenFromMicrotime = () => {
  const hrtime = process.hrtime()
  const microtime = ((hrtime[0] * 1000000 + hrtime[1] / 1000) / 1000)
  const token = Crypto.createHash('sha256').update(microtime.toString()).digest('hex')
  return token
}

const promisify = (fn) => new Promise((resolve, reject) => fn(resolve).catch(reject))

const removeAccents = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export {
  sliceArrayIntoChunks,
  generateTokenFromMicrotime,
  promisify,
  removeAccents
}
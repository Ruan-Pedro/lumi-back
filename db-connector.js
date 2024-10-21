import Knex from 'knex'

function dbConnector() {
  const {
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT
  } = process.env

  if (!DB_HOST || !DB_USERNAME || !DB_PASSWORD || !DB_NAME || !DB_PORT) {
    throw new Error('Database configs are missing!')
  }

  return Knex({
    client: 'pg',
    // version: '8.0.25',
    connection: {
      host: DB_HOST,
      port : DB_PORT,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME
    },
    pool: {
        max: 300,
        min: 1
    },
    acquireConnectionTimeout: 600 * 20,
    searchPath: ['LumiDB', 'public']
  })
}

export default dbConnector
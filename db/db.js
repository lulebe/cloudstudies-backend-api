const Sequelize = require('sequelize')

const dialectOptions = process.env.DBSSLKEY ? {
  ssl: {
    key: process.env.DBSSLKEY,
    cert: process.env.DBSSLCERT,
    ca: process.env.DBSSLCA
  }
} : null

const db = new Sequelize(process.env.DBNAME, process.env.DBUSR, process.env.DBPW, {
  host: process.env.DBHOST,
  port: process.env.DBPORT,
  dialect: 'mysql',
  pool: {
    max: 3,
    min: 0,
    idle: 10000
  },
  dialectOptions
})

module.exports = db

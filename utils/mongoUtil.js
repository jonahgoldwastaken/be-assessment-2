const mongoose = require('mongoose')
const url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

const connect = callback =>
    mongoose.connect(url, callback)

module.exports = {
    connect: connect
}
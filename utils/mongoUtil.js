const mongoose = require('mongoose')
const Schema = mongoose.Schema
const url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}`
module.exports = {
    connect: callback =>
        mongoose.connect(url, callback),
}
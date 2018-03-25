const express = require('express')
const mongo = require('mongodb')

require('dotenv').config()

const home = require('./routes/home')
const account = require('./routes/account')
const hobbyCategories = require('./routes/hobbies')
const messages = require('./routes/messages')

const app = express()

const url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}`
let db

mongo.MongoClient.connect(url, (err, client) => {
    if (err) console.error(err)
    else db = client.db(process.env.DB_NAME)
})

module.exports = app
    .set('view engine', 'ejs')
    .set('views', 'views')
    .use(express.static('assets'))
    .use('/home', home)
    .use('/account', account)
    .use('/hobbies', hobbyCategories)
    .use('/messages', messages)
    .get('/', (req, res) => res.render('onboarding'))
    .listen(1337)
    .db = db
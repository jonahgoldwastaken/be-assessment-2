require('dotenv').config()
const express = require('express')
const compression = require('compression')
const logger = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const multerUtil = require('./utils/multerUtil')

multerUtil.createInstance()

const home = require('./routes/home')
const account = require('./routes/account')
const hobbyCategories = require('./routes/hobbies')
const messages = require('./routes/messages')

const url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
const port = process.env.PORT || 3000
mongoose.connect(url, (err) => {
    if (err) {
        console.error(err)
        return
    }
    const app = express()
    module.exports = app
        .set('view engine', 'ejs')
        .set('views', 'views')
        .use(compression())
        .use(logger('dev'))
        .use('/images', express.static('uploads'))
        .use('/', express.static('assets'))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(session({
            resave: false,
            saveUninitialized: true,
            secret: process.env.SESSION_SECRET
        }))
        .use('/home', home)
        .use('/account', account)
        .use('/hobbies', hobbyCategories)
        .use('/messages', messages)
        .get('/', (req, res) => res.render('onboarding'))
        // TODO: add error handling function
        .listen(port)
})

require('dotenv').config()
const express = require('express')
const compression = require('compression')
const logger = require('morgan')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoDBStore = require('connect-mongodb-session')(session)
const httpStatus = require('http-status')
const multerUtil = require('./utils/multerUtil')

multerUtil.createInstance()

const home = require('./routes/home')
const account = require('./routes/account')
const hobbyCategories = require('./routes/hobbies')
const messages = require('./routes/messages')

const url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
const port = process.env.PORT || 3000
// Due to MemoryStorage error https://github.com/expressjs/session#compatible-session-stores
const store = new MongoDBStore({
    uri: `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    databaseName: process.env.DB_NAME,
    collection: 'sessions'
}, err => err && console.error(err))

store.on('error', err => err && console.error(err))

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
        .use(methodOverride('_method'))
        .use(logger('dev'))
        .use('/images', express.static('uploads'))
        .use('/', express.static('assets'))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(session({
            resave: false,
            saveUninitialized: true,
            secret: process.env.SESSION_SECRET,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 28, // 4 weeks aka about a month
                secure: process.env.NODE_ENV === 'production'
            },
            store
        }))
        .use('/home', home)
        .use('/account', account)
        .use('/hobbies', hobbyCategories)
        .use('/messages', messages)
        .get('/', (req, res) => res.render('onboarding'))
        .use((reqErr, req, res) => {
            if (reqErr.err) {
                console.log('request error: ', reqErr.err)
                reqErr.message = httpStatus[reqErr.status]
                res.status(reqErr.status).render('error', {
                    data: reqErr,
                    back: req.headers('Referer')
                })
            }
            return false
        })
        .listen(port)
})

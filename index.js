require('dotenv').config()
const express = require('express')
const http = require('http')
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const session = require('express-session')
const mongoUtil = require('./utils/mongoUtil')
const multerUtil = require('./utils/multerUtil')
console.log(process.env)
mongoUtil.connect(err => {
    err && console.error(err)
    multerUtil.createInstance()
    const app = express()
    const home = require('./routes/home')
    const account = require('./routes/account')
    const hobbyCategories = require('./routes/hobbies')
    const messages = require('./routes/messages')
    module.exports = app
        .set('view engine', 'ejs')
        .set('views', 'views')
        .use(express.static('assets'))
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
    http.createServer(app).listen(port, () => console.log(`started server on port ${port}`))
})
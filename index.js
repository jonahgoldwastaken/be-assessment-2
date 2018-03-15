const express = require('express')

const home = require('./routes/home')
const account = require('./routes/account')
const hobbyCategories = require('./routes/hobbies')
const messages = require('./routes/messages')

const app = express()
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

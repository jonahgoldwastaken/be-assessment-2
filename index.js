const express = require('express')

const account = require('./routes/account')

const app = express()
module.exports = app
    .set('view engine', 'ejs')
    .set('views', 'views')
    .use(express.static('assets'))
    .use('/account', account)
    .get('/', (req, res) => res.render('onboarding.ejs'))
    .listen(1337)

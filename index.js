const express = require('express')

const app = express()
app
    .set('view engine', 'ejs')
    .set('views', 'views')
    .use(express.static('assets'))
    .get('/', (req, res) => res.render('onboarding.ejs'))
    .listen(1337)
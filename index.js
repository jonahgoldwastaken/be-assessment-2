
const express = require('express')
const app = express()

app
    .set('view engine', 'ejs')
    .set('views', 'view')
    .use(express.static('assets'))

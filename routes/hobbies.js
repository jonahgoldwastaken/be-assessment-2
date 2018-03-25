/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/', (req, res) => res.render('hobbies/hobbies'))
    .get('/request', (req, res) => res.render('hobbies/request'))

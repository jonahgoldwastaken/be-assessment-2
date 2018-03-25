/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/', (req, res) => res.render('login/home'))
    .get('/match', (req, res) => res.render('login/home-match'))
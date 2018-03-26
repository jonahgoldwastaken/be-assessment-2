/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/', (req, res) => res.render('home/home'))
    .get('/match', (req, res) => res.render('home/user-profile'))
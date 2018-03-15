/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/', (req, res) => res.render('hobbies/categories'))
    .get('/filter', (req, res) => res.render('hobbies/categories'))
    .get('/hobbies', (req, res) => res.render('hobbies/hobbies'))

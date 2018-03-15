/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/', (req, res) => res.render('hobbies/categories.ejs'))
    .get('/filter', (req, res) => res.render('hobbies/categories.ejs'))
    .get('/hobbies', (req, res) => res.render('hobbies/hobbies.ejs'))

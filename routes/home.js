/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/', homePage)
    .get('/', (req, res) => res.render('home/user-profile'))

function homePage (req, res) {
    res.render('home/home')
}
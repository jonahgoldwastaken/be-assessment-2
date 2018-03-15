/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/', (req, res) => res.render('login/messages'))
    .get('/chat', (req, res) => res.render('login/chat'))
    .get('/logout', (req, res) => res.render('logout/messages'))

/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/', (req, res) => res.render('messages/list'))
    .get('/:chat', (req, res) => res.render('messages/chat'))

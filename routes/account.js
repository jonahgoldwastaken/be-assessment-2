/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/step-1', (req, res) => res.render('create-account/step-1.ejs'))

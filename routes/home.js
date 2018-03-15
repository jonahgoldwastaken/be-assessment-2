/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/', (req, res) => res.render('login/home.ejs'))
    .get('/match', (req, res) => res.render('login/home-match.ejs'))
    .get('/other', (req, res) => res.render('login/home-other-account.ejs'))
    /* LOGOUT */
    .get('/logout', (req, res) => res.render('logout/home.ejs'))
    .get('/logout-popup', (req, res) => res.render('logout/home-pop-up.ejs'))

/* eslint-disable new-cap */
const router = require('express').Router()

module.exports = router
    .get('/', (req, res) => res.render('login/home'))
    .get('/match', (req, res) => res.render('login/home-match'))
    .get('/other', (req, res) => res.render('login/home-other-account'))
    /* LOGOUT */
    .get('/logout', (req, res) => res.render('logout/home'))
    .get('/logout-popup', (req, res) => res.render('logout/home-pop-up'))

/* eslint-disable new-cap */
const router = require('express').Router()
const create = require('./create')

module.exports = router
    .get('/', (req, res) => res.render('login/profile'))
    .get('/user', (req, res) => res.render('login/user-profile'))
    .get('/step-1', (req, res) => res.render('create-account/step-1.ejs'))
    .get('/step-2', (req, res) => res.render('create-account/step-2.ejs'))
    .get('/edit', (req, res) => res.render('login/profile-edit.ejs'))
    .get('/settings', (req, res) => res.render('login/settings.ejs'))
    .get('/advantages', (req, res) => res.render('logout/advantages.ejs'))
    .use('/create', create)

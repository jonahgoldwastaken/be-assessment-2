/* eslint-disable new-cap */
const router = require('express').Router()
const create = require('./create')

module.exports = router
    .use('/create', create)
    .get('/login', (req, res) => res.render('account/profile'))
    .get('/edit', (req, res) => res.render('account/edit-profile'))
    .get('/hobbies', (req, res) => res.render('hobbies/hobbies'))
    .get('/hobbies/:hobby/personalise', (req, res) => res.render('hobbies/hobbies'))
    .get('/settings', (req, res) => res.render('account/settings'))
    .get('/', (req, res) => res.render('account/profile'))

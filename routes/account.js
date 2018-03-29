/* eslint-disable new-cap */
const router = require('express').Router()
const create = require('./create')
const argon2 = require('argon2')
const Account = require('../models/Account')
const mongoUtil = require('../utils/mongoUtil')

module.exports = router
    .use('/create', create)
    .get('/login', (req, res) => res.render('account/login'))
    .post('/login', login)
    .get('/edit', (req, res) => res.render('account/edit'))
    .get('/hobbies', (req, res) => res.render('hobbies/list'))
    .get('/hobbies/:hobby/personalise', (req, res) => res.render('hobbies/list'))
    .get('/settings', (req, res) => res.render('account/settings'))
    .get('/', userProfile)

function login (req, res, next) {
    const email = req.body.email
    const password = req.body.password
    Account.findOne({ email: email }, (err, user) => {
        err
            ? next(err)
            : argon2.verify(user.password, password)
                .then(match => {
                    if (match) {
                        mongoUtil.loginUser(req, user._id)
                        res.status(200).redirect('/home')
                    } else {
                        res.status(400).redirect('/account/login')
                    }
                })
                .catch(err => console.error(err))
    })
}

function userProfile (req, res, next) {
    mongoUtil.getLoggedInUser(req)
        .then(data =>
            !data
                ? res.redirect('/')
                : data)
        .then(data =>
            res.render('account/profile', {
                data: data
            }))
        .catch(err => next(err))
}
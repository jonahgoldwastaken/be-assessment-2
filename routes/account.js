/* eslint-disable new-cap */
const router = require('express').Router()
const create = require('./create')
const argon2 = require('argon2')
const Account = require('../models/Account')
const mongoUtil = require('../utils/mongoUtil')

const login = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const user = await Account.findByEmail(email)
        if (user) {
            const match = await argon2.verify(user.password, password)
            if (match) {
                mongoUtil.loginUser(req, user._id)
                res.status(200).redirect('/home')
            } else {
                res.status(400).redirect('/account/login')
            }
        }
    } catch (err) {
        next(err)
    }
}

const profile = async (req, res, next) => {
    try {
        const data = await mongoUtil.getLoggedInUser(req)
        if (!data) {
            res.redirect('/')
        } else {
            res.render('account/profile', {
                data: data
            })
        }
    } catch (err) {
        next(err)
    }
}

const editForm = async (req, res, next) => {
    try {
        const data = await mongoUtil.getLoggedInUser(req)
        if (!data) {
            res.redirect('/')
        } else {
            res.render('account/edit', {
                data: data
            })
        }
    } catch (err) {
        next(err)
    }
}

module.exports = router
    .use('/create', create)
    .get('/login', (req, res) => res.render('account/login'))
    .post('/login', login)
    .get('/edit', editForm)
    .get('/hobbies', (req, res) => res.render('hobbies/list'))
    .get('/hobbies/:hobby/personalise', (req, res) => res.render('hobbies/list'))
    .get('/settings', (req, res) => res.render('account/settings'))
    .get('/', profile)
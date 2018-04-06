/* eslint-disable new-cap */
const router = require('express').Router()
const create = require('./create')
const argon2 = require('argon2')
const accountUtil = require('../utils/accountUtil')

const login = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const user = await accountUtil.find.byEmail(email)
        if (user) {
            const match = await argon2.verify(user.password, password)
            if (match) {
                accountUtil.currentUser.logIn(req, user._id)
                res.status(200).redirect('/home')
            } else {
                throw { password: 'Het opgegeven wachtwoord is onjuist.'}
            }
        } else {
            throw { email: 'Het ingevoerde e-mailadres is niet gevonden.' }
        }
    } catch (err) {
        res.render('account/login', {
            error: err,
            email: email
        })
    }
}

const profile = async (req, res, next) => {
    if (accountUtil.currentUser.isLoggedIn(req)) {
        try {
            const data = await accountUtil.currentUser.get(req)
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
}

const editForm = async (req, res, next) => {
    try {
        const data = await accountUtil.currentUser.get(req)
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

const userProfile = async (req, res, next) => {
    const id = req.params.id
    try {
        const data = await accountUtil.find.byId(id)
        if (!data) {
            res.redirect('/home')
        } else {
            res.render('home/user-profile', {
                data: data,
                back: req.header('Referer')
            })
        }
    } catch (err) {
        next(err)
    }
}

module.exports = router
    .use('/create', create)
    .get('/login', (req, res) =>
        res.render('account/login', { error: {}, email: '' }))
    .post('/login', login)
    .get('/edit', editForm)
    .get('/hobbies', (req, res) => res.render('hobbies/list'))
    .get('/hobbies/:hobby/personalise', (req, res) => res.render('hobbies/list'))
    .get('/settings', (req, res) => res.render('account/settings'))
    .get('/:id', userProfile)
    .get('/', profile)
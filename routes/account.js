/* eslint-disable new-cap */
const router = require('express').Router()
const create = require('./create')
const argon2 = require('argon2')
const account = require('../utils/accountUtil')
const hobby = require('./hobby')

/**
 * Logs user in, creates session and redirects to home.
 * @param {Request} req
 * @param {Response} res
 */
const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await account.find.byEmail(email)
        if (user) {
            const match = await argon2.verify(user.password, password)
            if (match) {
                account.currentUser.logIn(req, user._id)
                res.status(200).redirect('/home')
            } else {
                throw new Error({ password: 'Het opgegeven wachtwoord is onjuist.' })
            }
        } else {
            throw new Error({ email: 'Het ingevoerde e-mailadres is niet gevonden.' })
        }
    } catch (err) {
        res.render('account/login', {
            error: err,
            email
        })
    }
}

/**
 * Renders logged in user profile
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const profile = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            const data = await account.currentUser.get(req)
            if (!data) {
                res.status(404).redirect('/account/login')
            } else {
                res.render('account/profile', {
                    data
                })
            }
        } catch (err) {
            next(err)
        }
    } else {
        res.status(403).redirect('/account/login')
    }
}

/**
 * Renders edit form filled in data from users document
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const editForm = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            const data = await account.currentUser.get(req)
            if (!data) {
                res.status(500).redirect('/')
            } else {
                res.render('account/edit', {
                    data
                })
            }
        } catch (err) {
            next(err)
        }
    } else {
        res.redirect('/account/login')
    }
}

const updateProfile = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            const { body, file } = req
            const oldUser = await account.currentUser.get(req)
            body.avatar = !file ? oldUser.avatar : body.avatart
            await oldUser.update(body)
            res.redirect('/account')
        } catch (err) {
            next(err)
        }
    } else {
        res.redirect('/account/login')
    }
}

/**
 * Renders user profile
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const userProfile = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            const { params: { id }, header } = req
            const data = await account.find.byId(id)
            if (!data) {
                res.redirect('/home')
            } else {
                res.render('home/user-profile', {
                    data,
                    back: header('Referer')
                })
            }
        } catch (err) {
            next(err)
        }
    } else {
        res.redirect('/account/login')
    }
}

module.exports = router
    .use('/create', create)
    .use('/hobbies', hobby)
    .get('/login', (req, res) =>
        res.render('account/login', { error: {}, email: '' }))
    .post('/login', login)
    .get('/edit', editForm)
    .get('/:id', userProfile)
    .get('/', profile)
    .patch('/', updateProfile)

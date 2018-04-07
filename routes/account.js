/* eslint-disable new-cap */
const router = require('express').Router()
const create = require('./create')
const argon2 = require('argon2')
const accountUtil = require('../utils/accountUtil')
const hobbyUtil = require('../utils/hobbyUtil')

/**
 * Logs user in, creates session and redirects to home.
 * @param {Request} req
 * @param {Response} res
 */
const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await accountUtil.find.byEmail(email)
        if (user) {
            const match = await argon2.verify(user.password, password)
            if (match) {
                accountUtil.currentUser.logIn(req, user._id)
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
    if (accountUtil.currentUser.isLoggedIn(req)) {
        try {
            const data = await accountUtil.currentUser.get(req)
            if (!data) {
                res.status(403).redirect('/account/login')
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
    try {
        const data = await accountUtil.currentUser.get(req)
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
}

/**
 * Renders hobby list page with all hobbies except own from user
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const hobbyList = async (req, res, next) => {
    if (accountUtil.currentUser.isLoggedIn(req)) {
        try {
            const account = await accountUtil.currentUser.get(req)
            const allHobbies = await hobbyUtil.find.all()
            const filteredHobbies = hobbyUtil.filter.user(allHobbies, account)
            if (!account) {
                res.status(500).redirect('/account/login')
            } else {
                res.render('account/hobbies', {
                    own: account.hobbies,
                    all: filteredHobbies
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
 * Renders user profile
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const userProfile = async ({ req: { header, params: { id } } }, res, next) => {
    try {
        const data = await accountUtil.find.byId(id)
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
}

module.exports = router
    .use('/create', create)
    .get('/login', (req, res) =>
        res.render('account/login', { error: {}, email: '' }))
    .post('/login', login)
    .get('/edit', editForm)
    .get('/hobbies', hobbyList)
    .get('/hobbies/:hobby/personalise', (req, res) => res.render('hobbies/list'))
    .get('/settings', (req, res) => res.render('account/settings'))
    .get('/:id', userProfile)
    .get('/', profile)

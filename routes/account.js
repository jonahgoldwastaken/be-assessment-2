const router = require('express').Router()
const argon2 = require('argon2')
const Jimp = require('jimp')
const account = require('../utils/accountUtil')
const upload = require('../utils/multerUtil').getInstance()

const create = require('./create')
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

/**
 * Updates user profile with provided data
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const updateProfile = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            const { body, file } = req
            let redirectUrl = '/account'
            const oldUser = await account.currentUser.get(req)
            const updatedUser = {
                firstName: body.first_name || oldUser.firstName,
                lastName: body.last_name || oldUser.lastName,
                age: body.age || oldUser.age,
                location: body.location || oldUser.location,
                sex: body.sex || oldUser.sex,
                sexPref: body.sex_pref || oldUser.sexPref,
                ageRange: {
                    min: body.age_min || oldUser.ageRange.min,
                    max: body.age_max || oldUser.ageRange.max
                }
            }
            if (body.password_old && body.password_new) {
                const match = await argon2.verify(oldUser.password, body.password_old)
                if (match) {
                    const hash = await argon2.hash(body.password_new)
                    updatedUser.password = hash
                    redirectUrl = '/account/login'
                }
            }
            if (file) {
                const newImage = await Jimp.read(`uploads/${file.filename}`)
                newImage.resize(Jimp.AUTO, 960).quality(70).write(`uploads/${file.filename}`)
                updatedUser.avatar = file.filename
            } else {
                updatedUser.avatar = oldUser.avatar
            }
            await oldUser.update(updatedUser)
            res.redirect(redirectUrl)
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
            const { params: { id } } = req
            const { _id: loggedInID } = await account.currentUser.get(req)
            const data = await account.find.byId(id)
            if (!data) {
                res.redirect('back')
            } else {
                res.render('home/user-profile', {
                    data,
                    match: data.matches.some(match => match.equals(loggedInID)),
                    back: req.header('Referer')
                })
            }
        } catch (err) {
            next(err)
        }
    } else {
        res.redirect('/account/login')
    }
}

const logOut = (req, res) => {
    if (account.currentUser.isLoggedIn(req))
        account.currentUser.logOut(req)
    res.redirect('/account/login')
}

const deleteAccount = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            await account.currentUser.delete(req)
            res.redirect('/')
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
    .get('/login', (req, res) => res.render('account/login', { error: {}, email: '' }))
    .post('/login', login)
    .get('/logout', logOut)
    .get('/edit', editForm)
    .get('/delete', deleteAccount)
    .get('/:id', userProfile)
    .get('/', profile)
    .patch('/', upload.single('avatar'), updateProfile)

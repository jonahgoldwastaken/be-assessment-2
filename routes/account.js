const router = require('express').Router()
const argon2 = require('argon2')
const Jimp = require('jimp')
const account = require('../utils/accountUtil')
const multer = require('../utils/multerUtil')

const upload = multer.getInstance()

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
        const user = await account.find.email(email)
        if (user) {
            const match = await argon2.verify(user.password, password)
            if (match) {
                account.currentUser.logIn(req, user._id)
                res.status(200).redirect('/home')
            } else {
                throw new Error('{ "password": "Het opgegeven wachtwoord is onjuist." }')
            }
        } else {
            throw new Error('{ "email": "Het ingevoerde e-mailadres is niet gevonden." }')
        }
    } catch (err) {
        console.error(err)
        res.render('account/login', {
            error: JSON.parse((err.message)),
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
            next({ err, status: 500 })
        }
    } else {
        res.status(401).redirect('/account/login')
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
                res.status(404).redirect('/')
            } else {
                res.render('account/edit', {
                    data
                })
            }
        } catch (err) {
            next({ err, status: 500 })
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
                const newName = `${updatedUser.firstName}${updatedUser.location}${updatedUser.age}`
                const processedName = await multer.renameFile(file, newName)
                const newImage = await Jimp.read(`uploads/${processedName}`)
                newImage.resize(Jimp.AUTO, 960).quality(70).write(`uploads/${processedName}`)
                updatedUser.avatar = file.filename
            } else {
                updatedUser.avatar = oldUser.avatar
            }
            await oldUser.update(updatedUser)
            res.redirect(redirectUrl)
        } catch (err) {
            next({ err, status: 422 })
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
            const data = await account.find.id(id)
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
            next({ err, status: 404 })
        }
    } else {
        res.redirect('/account/login')
    }
}

/**
 * Logs out user
 * @param {Request} req
 * @param {Response} res
 */
const logOut = (req, res) => {
    if (account.currentUser.isLoggedIn(req))
        account.currentUser.logOut(req)
    res.redirect('/account/login')
}

/**
 * Deletes user account
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const deleteAccount = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            await account.currentUser.delete(req)
            res.redirect('/')
        } catch (err) {
            next({ err, status: 500 })
        }
    } else {
        res.redirect('/account/login')
    }
}

/**
 * Unmatches provided user
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const unmatch = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            const { id } = req.params
            const loggedInUser = await account.currentUser.get(req)
            const match = await account.find.id(id)
            const iOne = loggedInUser.matches.findIndex(userId => userId.equals(match._id))
            const iTwo = match.matches.findIndex(userId => userId.equals(loggedInUser._id))
            loggedInUser.matches.splice(iOne, 1)
            match.matches.splice(iTwo, 1)
            loggedInUser.dislikes.push(id)
            match.dislikes.push(loggedInUser._id)
            await loggedInUser.update(loggedInUser)
            await match.update(match)
            res.redirect('/home')
        } catch (err) {
            next({ err, status: 500 })
        }
    } else {
        res.status(401).redirect('/account/login')
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
    .get('/', profile)
    .patch('/', upload.single('avatar'), updateProfile)
    .delete('/unmatch/:id', unmatch)
    .get('/:id', userProfile)

/* eslint-disable new-cap */
const router = require('express').Router()
const create = require('./create')
const argon2 = require('argon2')
const upload = require('../utils/multerUtil').getInstance()
const account = require('../utils/accountUtil')
const hobby = require('../utils/hobbyUtil')

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
}

/**
 * Renders hobby list page with all hobbies except own from user
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const hobbyList = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            const loggedInUser = await account.currentUser.get(req)
            const allHobbies = await hobby.find.all()
            const filteredHobbies = hobby.filter.user(allHobbies, loggedInUser)
            if (!loggedInUser) {
                res.status(500).redirect('/account/login')
            } else {
                res.render('account/hobbies', {
                    own: loggedInUser.hobbies,
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

const editHobbyForm = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        const { id } = req.params
        try {
            const { hobbyCustom: customProperties } = await account.currentUser.get(req)
            const hobbyToEdit = Object.assign(await hobby.find.id(id), customProperties[id])
            res.render('account/hobby', {
                data: hobbyToEdit
            })
        } catch (err) {
            next(err)
        }
    } else {
        res.status(403).redirect('/account/login')
    }
}

const editHobby = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        const { params: { id: _id }, body: { description }, file } = req
        try {
            const loggedInUser = await account.currentUser.get(req)
            const { hobbyCustom } = loggedInUser
            const newCustomProperties = {
                _id,
                image: file && file.filename,
                description
            }
            const i = hobbyCustom.findIndex(customHobby => customHobby._id.equals(_id))
            if (i < 0)
                hobbyCustom.push(newCustomProperties)
            else
                hobbyCustom[i] = newCustomProperties
            await loggedInUser.update({ $set: { hobbyCustom } })
            res.redirect('back')
        } catch (err) {
            next(err)
        }
    }
}

const addHobby = async (req, res, next) => {
    const { id: newHobby } = req.params
    try {
        const loggedInUser = await account.currentUser.getWithoutHobbies(req)
        const { hobbies } = loggedInUser
        hobbies.push(newHobby)
        await loggedInUser.update({ $set: { hobbies } })
        res.redirect('back')
    } catch (err) {
        next(err)
    }
}


const deleteHobby = async (req, res, next) => {
    const { params: { id: hobbyToDelete } } = req
    try {
        const loggedInUser = await account.currentUser.getWithoutHobbies(req)
        const { hobbies } = loggedInUser
        hobbies.splice(hobbies.indexOf(hobbyToDelete), 1)
        await loggedInUser.update({ $set: { hobbies } })
        res.redirect('back')
    } catch (err) {
        next(err)
    }
}

/**
 * Renders user profile
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const userProfile = async ({ header, params: { id } }, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
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
    }
}

module.exports = router
    .use('/create', create)
    .get('/login', (req, res) =>
        res.render('account/login', { error: {}, email: '' }))
    .post('/login', login)
    .get('/edit', editForm)
    .get('/hobbies', hobbyList)
    .get('/hobbies/:id', editHobbyForm)
    .put('/hobbies/:id', upload.single('image'), editHobby)
    .post('/hobbies/:id', addHobby)
    .delete('/hobbies/:id', deleteHobby)
    .get('/settings', (req, res) => res.render('account/settings'))
    .get('/:id', userProfile)
    .get('/', profile)

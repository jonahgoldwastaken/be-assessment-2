/* eslint-disable new-cap */
const router = require('express').Router()
const argon = require('argon2')
const upload = require('../utils/multerUtil').getInstance()
const Account = require('../models/Account')
const accountUtil = require('../utils/accountUtil')
const hobbyUtil = require('../utils/hobbyUtil')

/**
 * Renders registration forms
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const accountForms = async (req, res, next) => {
    const step = +req.params.step
    let registrationData = null

    if (req.session.registration) {
        registrationData = req.session.registration
        if (step !== registrationData.step)
            res.redirect(`/account/create/${registrationData.step}`)
    }

    const stepOne = () =>
        res.render('account/create-account/step-1')

    const stepTwo = () =>
        res.render('account/create-account/step-2', {
            partialUser: registrationData
        })

    const stepThree = async () => {
        try {
            const hobbies = await hobbyUtil.find.all()
            res.render('account/create-account/step-3', {
                partialUser: registrationData,
                data: hobbies
            })
        } catch (err) {
            next(err)
        }
    }

    switch (step) {
        case 3:
            stepThree()
            break
        case 2:
            stepTwo()
            break
        default:
            stepOne()
            break
    }
}

/**
 * Registers user after final step is complete
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const registerUser = (req, res, next) => {
    const { hobbies } = req.body
    req.session.registration = Object.assign(req.session.registration, {
        hobbies: typeof hobbies === 'string'
            ? [hobbies]
            : hobbies
    })
    delete req.session.registration.step

    const newUser = new Account(req.session.registration)
    newUser.save((err, user) => {
        if (err) {
            next(err)
        } else {
            delete req.session.registration
            req.session.user = {
                _id: user._id
            }
            res.status(201).redirect('/home')
        }
    })
}

/**
 * Saves registration progress to session
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const registerSession = (req, res, next) => {
    const step = +req.params.step

    const stepOne = async () => {
        const { email, password } = req.body
        try {
            const emailExists = await accountUtil.find.byEmail(email)
            if (!emailExists) {
                const hashedPassword = await argon.hash(password)
                req.session.registration = {
                    step: 2,
                    email,
                    password: hashedPassword
                }
                res.status(200).redirect('/account/create/2')
            } else {
                res.status(400).redirect('/account/create/1')
            }
        } catch (err) {
            next(err)
        }
    }

    const stepTwo = () => {
        const { body, file } = req
        req.session.registration = Object.assign(req.session.registration, {
            step: 3,
            firstName: body.first_name,
            lastName: body.last_name,
            age: body.age,
            location: body.location,
            sex: body.sex,
            sexPref: typeof body.sex_pref === 'string'
                ? [body.sex_pref]
                : body.sex_pref,
            ageRange: {
                min: body.age_min,
                max: body.age_max
            },
            avatar: file.filename
        })
        res.status(200).redirect('/account/create/3')
    }

    switch (step) {
        case 2:
            stepTwo()
            break
        default:
            stepOne()
            break
    }
}

module.exports = router
    .get('/', (req, res) => res.redirect('/account/create/1'))
    .get('/:step', accountForms)
    .post('/:step', upload.single('avatar'), registerSession)
    .post('/', registerUser)

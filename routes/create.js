/* eslint-disable new-cap */
const router = require('express').Router()
const argon = require('argon2')
const upload = require('../utils/multerUtil').getInstance()
const Account = require('../models/Account')
const Hobby = require('../models/Hobby')

module.exports = router
    .get('/', (req, res) => res.redirect('/account/create/1'))
    .get('/:step', accountForms)
    .post('/:step', upload.single('avatar'), registerSession)
    .post('/', registerUser)

async function accountForms (req, res) {
    let step = +req.params.step
    let registrationData = null
    if (req.session.registration) {
        registrationData = req.session.registration
        step != registrationData.step ? res.redirect(`/account/create/${registrationData.step}`) : ''
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

    function stepOne () {
        res.render('account/create-account/step-1')
    }

    function stepTwo () {
        res.render('account/create-account/step-2', {
            partialUser: registrationData
        })
    }

    async function stepThree () {
        const hobbies = await Hobby.findAllAndSort()
        res.render('account/create-account/step-3', {
            partialUser: registrationData,
            data: hobbies
        })
    }
}

function registerUser (req, res, next) {
    req.session.registration =  Object.assign(req.session.registration, {
        hobbies: req.body.hobbies || []
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

function registerSession (req, res, next) {
    const step = +req.params.step
    switch (step) {
        case 2:
            stepTwo()
            break
        case 1:
            stepOne()
            break
    }
    return

    async function stepOne () {
        const email = req.body.email
        const password = req.body.password
        const hashedPassword = await argon.hash(password).catch(next)
        req.session.registration = {
            step: 2,
            email: email,
            password: hashedPassword
        }
        res.status(200).redirect('/account/create/2')
    }

    function stepTwo () {
        req.session.registration = Object.assign(req.session.registration, {
            step: 3,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            age: req.body.age,
            location: req.body.location,
            sex: req.body.sex,
            sexPref: req.body.sex_pref,
            avatar: req.file.filename
        })
        res.status(200).redirect('/account/create/3')
    }
}
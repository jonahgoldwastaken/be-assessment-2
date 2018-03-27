/* eslint-disable new-cap */
const router = require('express').Router()
const argon = require('argon2')
const db = require('../utils/mongoUtil').getInstance()
const upload = require('../utils/multerUtil').getInstance()

module.exports = router
    .get('/:step', accountForms)
    .post('/:step', upload.single('image'), registerSession)
    .post('/', registerUser)

function accountForms (req, res) {
    let step = +req.params.step
    let registrationData = null
    if (req.session.registration) {
        registrationData = req.session.registration
        step == 1 ? step = 2 : null
    }
    switch (step) {
        case 3:
            res.render('account/create-account/step-3', {
                partialUser: registrationData
            })
            break
        case 2:
            res.render('account/create-account/step-2', {
                partialUser: registrationData
            })
            break
        default:
            res.render('account/create-account/step-1')
            break
    }
}

function registerUser (req, res) {
    const newUser = Object.assign(req.session.registration, {
        hobbies: req.body.hobbies
    })
    delete newUser.step
    db.collection('users').insertOne(newUser, (err, data) => {
        if (err) {
            console.error(err)
        } else {
            req.session.destroy()
            req.session.user = {
                _id: data._id,
                name: data.name
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

    function stepTwo () {
        req.session.registration = Object.assign(req.session.registration, {
            step: 3,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            age: req.body.age,
            location: req.body.location,
            sex: req.body.sex,
            sexPref: req.body.sex_pref,
            image: req.file.filename
        })
        res.status(200).redirect('/account/create/3')
    }

    function stepOne () {
        const email = req.body.email
        const password = req.body.password
        argon.hash(password)
            .then(hashedPassword => {
                req.session.registration = {
                    step: 2,
                    email: email,
                    password: hashedPassword
                }
                res.status(200).redirect('/account/create/2')
            })
            .catch(err => next(err))
    }
}
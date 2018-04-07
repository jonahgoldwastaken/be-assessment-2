/* eslint-disable new-cap */
const router = require('express').Router()
const upload = require('../utils/multerUtil').getInstance()
const Hobby = require('../models/Hobby')

/**
 * Saves requested hobby
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const requestHobby = (req, res, next) => {
    const newHobby = new Hobby({
        name: req.body.name,
        image: req.file.filename
    })
    newHobby.save((err) => {
        if (err) next(err)
        res.redirect('/', 201)
    })
}

module.exports = router
    .get('/', (req, res) => res.render('hobbies/list'))
    .get('/request', (req, res) => res.render('hobbies/request'))
    .post('/request', upload.single('image'), requestHobby)

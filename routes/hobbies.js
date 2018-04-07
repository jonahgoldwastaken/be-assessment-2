/* eslint-disable new-cap */
const router = require('express').Router()
const upload = require('../utils/multerUtil').getInstance()
const hobby = require('../utils/hobbyUtil')

/**
 * Saves requested hobby
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const requestHobby = async (req, res, next) => {
    const newHobby = hobby.new({
        name: req.body.name,
        image: req.file.filename
    })
    try {
        await newHobby.save()
        res.status(201).redirect('/')
    } catch (err) {
        next(err)
    }
}

module.exports = router
    .get('/', (req, res) => res.render('hobbies/list'))
    .get('/request', (req, res) => res.render('hobbies/request'))
    .post('/request', upload.single('image'), requestHobby)

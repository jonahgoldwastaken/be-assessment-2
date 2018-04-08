const router = require('express').Router()
const Jimp = require('jimp')
const upload = require('../utils/multerUtil').getInstance()
const hobby = require('../utils/hobbyUtil')

/**
 * Saves requested hobby
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const requestHobby = async (req, res, next) => {
    const { body, file } = req
    try {
        const newImage = await Jimp.read(`uploads/${file.filename}`)
        newImage.resize(Jimp.AUTO, 960).quality(70).write(`uploads/${file.filename}`)
        const newHobby = hobby.new({
            name: body.name,
            image: file.filename
        })
        await newHobby.save()
        res.status(201).redirect('/')
    } catch (err) {
        next({ err, status: 422 })
    }
}

module.exports = router
    .get('/', (req, res) => res.render('hobbies/list'))
    .get('/request', (req, res) => res.render('hobbies/request'))
    .post('/request', upload.single('image'), requestHobby)

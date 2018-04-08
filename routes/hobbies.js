const router = require('express').Router()
const Jimp = require('jimp')
const multer = require('../utils/multerUtil')

const upload = multer.getInstance()
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
        const newName = req.body.name
        await multer.renameFile(file, newName)
        const newImage = await Jimp.read(`uploads/${newName}`)
        newImage.resize(Jimp.AUTO, 960).quality(70).write(`uploads/${newName}`)
        const newHobby = hobby.new({
            name: body.name,
            image: newName
        })
        await newHobby.save()
        res.status(201).redirect('/')
    } catch (err) {
        next({ err, status: 422 })
    }
}

module.exports = router
    .get('/request', (req, res) => res.render('hobbies/request'))
    .post('/request', upload.single('image'), requestHobby)

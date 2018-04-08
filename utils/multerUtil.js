const multer = require('multer')
const mime = require('mime-types')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) =>
        cb(null, `${req.body.name || req.session.userId || req.params.id}.${mime.extension(file.mimetype)}`)
})
let upload

/**
 * Creates Multer instance for use throughout the application
 */
const createInstance = () => {
    upload = multer({
        storage,
        fileFilter: (req, file, cb) =>
            cb(null, file.mimetype.split('/')[0] === 'image')
    })
}

/**
 * @returns {Object} Multer instance
 */
const getInstance = () => upload

module.exports = {
    createInstance,
    getInstance
}

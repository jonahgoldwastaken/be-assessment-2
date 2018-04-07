const multer = require('multer')

let upload

/**
 * Creates Multer instance for use throughout the application
 */
const createInstance = () => {
    upload = multer({
        dest: 'uploads',
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

const multer = require('multer')
let _upload

const createInstance = () =>
    _upload = multer({
        dest: 'uploads',
        fileFilter: (req, file, cb) =>
            cb(null, file.mimetype.split('/')[0] === 'image')
    })

const getInstance = () => _upload

module.exports = {
    createInstance: createInstance,
    getInstance: getInstance
}
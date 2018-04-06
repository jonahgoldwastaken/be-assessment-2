const multer = require('multer')

let upload

const createInstance = () => {
    upload = multer({
        dest: 'uploads',
        fileFilter: (req, file, cb) =>
            cb(null, file.mimetype.split('/')[0] === 'image')
    })
}

const getInstance = () => upload

module.exports = {
    createInstance,
    getInstance
}

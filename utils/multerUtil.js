const multer = require('multer')
let _upload
module.exports = {
    createInstance: () =>
        _upload = multer({
            dest: 'uploads',
            fileFilter: (req, file, cb) =>
                cb(null, file.mimetype.split('/')[0] === 'image')
        }),
    getInstance: () => _upload
}
const multer = require('multer')
const fs = require('fs')
const mime = require('mime-types')

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

/**
 * Changes file name with provided name
 * @param {Express.Multer.File} file File that needs a name change
 * @param {String} newName New name for file
 * @returns {Promise} Promise which resolves to nothing if rename is succesful
 */
const renameFile = (file, newName) =>
    new Promise(async (resolve, reject) => {
        fs.rename(`uploads/${file.filename}`, `uploads/${newName}.${mime.extension(file.mimetype)}`, (err) => {
            if (err) reject(err)
            resolve(`${newName}.${mime.extension(file.mimetype)}`)
        })
    })

module.exports = {
    createInstance,
    getInstance,
    renameFile
}

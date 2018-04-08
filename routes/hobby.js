const router = require('express').Router()
const Jimp = require('jimp')
const account = require('../utils/accountUtil')
const hobby = require('../utils/hobbyUtil')
const upload = require('../utils/multerUtil').getInstance()

/**
 * Renders hobby list page with all hobbies, seperated by if in logged in Account document
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const hobbyList = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            const loggedInUser = await account.currentUser.get(req)
            const allHobbies = await hobby.find.all()
            const filteredHobbies = hobby.filter.user(allHobbies, loggedInUser)
            if (!loggedInUser) {
                res.status(500).redirect('/account/login')
            } else {
                res.render('account/hobbies', {
                    own: loggedInUser.hobbies,
                    all: filteredHobbies
                })
            }
        } catch (err) {
            next(err)
        }
    } else {
        res.status(401).redirect('/account/login')
    }
}

/**
 * Renders the edit hobby form
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */

const editHobbyForm = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        const { id } = req.params
        try {
            const { hobbyCustom: customProperties } = await account.currentUser.get(req)
            const i = customProperties.findIndex(prop => prop._id.equals(id))
            let hobbyToEdit = await hobby.find.id(id)
            hobbyToEdit = hobby.compress.properties(hobbyToEdit, customProperties[i])
            res.render('account/hobby', {
                data: hobbyToEdit
            })
        } catch (err) {
            next({ err, status: 500 })
        }
    } else {
        res.status(401).redirect('/account/login')
    }
}

/**
 * Adds/updates custom properties of the provided hobby id to the logged in Account document
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */

const editHobby = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        const { params: { id: _id }, body: { description }, file } = req
        try {
            const loggedInUser = await account.currentUser.get(req)
            const { hobbyCustom } = loggedInUser
            if (file) {
                const newImage = await Jimp.read(`uploads/${file.filename}`)
                newImage.resize(Jimp.AUTO, 960).quality(70).write(`uploads/${file.filename}`)
            }
            const newCustomProperties = {
                _id,
                image: file && file.filename,
                description
            }
            const i = hobbyCustom.findIndex(customHobby => customHobby._id.equals(_id))
            if (i < 0) hobbyCustom.push(newCustomProperties)
            else hobbyCustom[i] = newCustomProperties
            await loggedInUser.update({ $set: { hobbyCustom } })
            res.redirect('/account/hobbies')
        } catch (err) {
            next({ err, status: 422 })
        }
    } else {
        res.redirect('/account/login')
    }
}

/**
 * Adds the provided hobby id to the logged in Account document
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const addHobby = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        const { id: newHobby } = req.params
        try {
            const loggedInUser = await account.currentUser.getWithoutHobbies(req)
            const { hobbies } = loggedInUser
            hobbies.push(newHobby)
            await loggedInUser.update({ $set: { hobbies } })
            res.redirect('back')
        } catch (err) {
            next({ err, status: 422 })
        }
    } else {
        res.redirect('/account/login')
    }
}

/**
 * Deletes the provided hobby id from the logged in Account document
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const deleteHobby = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        const { params: { id: hobbyToDelete } } = req
        try {
            const loggedInUser = await account.currentUser.getWithoutHobbies(req)
            const { hobbies } = loggedInUser
            hobbies.splice(hobbies.indexOf(hobbyToDelete), 1)
            await loggedInUser.update({ $set: { hobbies } })
            res.redirect('back')
        } catch (err) {
            next({ err, status: 400 })
        }
    } else {
        res.redirect('/account/login')
    }
}

module.exports = router
    .get('', hobbyList)
    .get('/:id', editHobbyForm)
    .put('/:id', upload.single('image'), editHobby)
    .post('/:id', addHobby)
    .delete('/:id', deleteHobby)

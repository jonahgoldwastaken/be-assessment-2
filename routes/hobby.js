const router = require('express').Router()
const account = require('../utils/accountUtil')
const hobby = require('../utils/hobbyUtil')
const upload = require('../utils/multerUtil').getInstance()

/**
 * Renders hobby list page with all hobbies except own from user
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
        res.status(403).redirect('/account/login')
    }
}

const editHobbyForm = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        const { id } = req.params
        try {
            const { hobbyCustom: customProperties } = await account.currentUser.get(req)
            const i = customProperties.findIndex(prop => prop._id.equals(id))
            const hobbyToEdit = Object.assign(await hobby.find.id(id), customProperties[i])
            res.render('account/hobby', {
                data: hobbyToEdit
            })
        } catch (err) {
            next(err)
        }
    } else {
        res.status(403).redirect('/account/login')
    }
}

const editHobby = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        const { params: { id: _id }, body: { description }, file } = req
        try {
            const loggedInUser = await account.currentUser.get(req)
            const { hobbyCustom } = loggedInUser
            const newCustomProperties = {
                _id,
                image: file && file.filename,
                description
            }
            const i = hobbyCustom.findIndex(customHobby => customHobby._id.equals(_id))
            if (i < 0)
                hobbyCustom.push(newCustomProperties)
            else
                hobbyCustom[i] = newCustomProperties
            await loggedInUser.update({ $set: { hobbyCustom } })
            res.redirect('back')
        } catch (err) {
            next(err)
        }
    } else {
        res.redirect('/account/login')
    }
}

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
            next(err)
        }
    } else {
        res.redirect('/account/login')
    }
}

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
            next(err)
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
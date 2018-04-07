/* eslint-disable new-cap */
const router = require('express').Router()
const account = require('../utils/accountUtil')

/**
 * Renders homepage
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const homePage = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            const loggedInUser = await account.currentUser.get(req)
            const fetchedUsers = await account.find.all()
            const processedUsers = await account.process.list(loggedInUser, fetchedUsers)
            res.render('home/home', {
                data: processedUsers[0]
            })
        } catch (err) {
            next(err)
        }
    } else {
        res.redirect('/account/login')
    }
}

module.exports = router
    .get('/', homePage)


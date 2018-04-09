/* eslint-disable new-cap */
const router = require('express').Router()
const account = require('../utils/accountUtil')

/**
 * Shows message list
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const messagesList = async (req, res, next) => {
    if (account.currentUser.isLoggedIn(req)) {
        try {
            const data = await account.currentUser.getWithMatches(req)
            res.render('messages/list', {
                data
            })
        } catch (err) {
            next({ err, status: 500 })
        }
    } else {
        res.redirect('/account/login')
    }
}

module.exports = router
    .get('/', messagesList)
    // .get('/:chat', (req, res) => res.render('messages/chat'))

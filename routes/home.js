/* eslint-disable new-cap */
const router = require('express').Router()
const Account = require('../models/Account')
const accountUtil = require('../utils/accountUtil')

const homePage = async (req, res, next) => {
    if (accountUtil.currentUser.isLoggedIn(req)) {
        try {
            const loggedInUser = await accountUtil.currentUser.get(req)
            const fetchedUsers = await Account.fetchAllUsers()
            const processedUsers = await Account.processUserList(loggedInUser, fetchedUsers)
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
    

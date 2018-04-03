/* eslint-disable new-cap */
const router = require('express').Router()
const Account = require('../models/Account')
const mongoUtil = require('../utils/mongoUtil')

const homePage = async (req, res, next) => {
    if (mongoUtil.isLoggedIn(req)) {
        try {
            const loggedInUser = await mongoUtil.getLoggedInUser(req)
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
    

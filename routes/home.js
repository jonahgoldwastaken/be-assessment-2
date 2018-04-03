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

const userProfile = async (req, res, next) => {
    const id = req.params.id
    try {
        const data = await Account.fetchUser(id)
        if (!data) {
            res.redirect('/home')
        } else {
            res.render('home/user-profile', {
                data: data
            })
        }
    } catch (err) {
        next(err)
    }
}

module.exports = router
    .get('/', homePage)
    .get('/user/:id', userProfile)

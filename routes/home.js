/* eslint-disable new-cap */
const router = require('express').Router()
const Account = require('../models/Account')
const mongoUtil = require('../utils/mongoUtil')
module.exports = router
    .get('/', homePage)
    // .get('/', (req, res) => res.render('home/user-profile'))

function homePage (req, res) {
    // mongoUtil.getLoggedInUser(req)
    //     .then(user => console.log(Account.getPopularity(user)))
    //     .catch(err => console.error(err))
    res.render('home/home')
    // Account.find({hobbies: {$ne: user.hobbies.hobby.id}}
}
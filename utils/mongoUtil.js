const mongoose = require('mongoose')
const url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
const Account = require('../models/Account')
module.exports = {
    connect: callback =>
        mongoose.connect(url, callback),
    getLoggedInUser (req) {
        const id = req.session.userId
        return new Promise(async (resolve, reject) => {
            try {
                const user = await Account.fetchUser(id)
                resolve(user)
            } catch (err) {
                reject(new Error(err))
            }
        })
    },
    isLoggedIn (req) {
        return !!req.session.userId
    },
    loginUser (req, id) {
        return req.session.userId = id
    }
}
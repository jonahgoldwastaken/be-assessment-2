const mongoose = require('mongoose')
const url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
const Account = require('../models/Account')
module.exports = {
    connect: callback =>
        mongoose.connect(url, callback),
    getLoggedInUser (req) {
        const id = req.session.userId
        return new Promise((resolve, reject) =>
            Account.findOne({ _id: id }, (err, data) =>
                err
                    ? reject(err)
                    : resolve(data)))
    },
    loginUser (req, id) {
        return req.session.userId = id
    }
}
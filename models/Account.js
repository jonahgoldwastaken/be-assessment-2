const mongoose = require('mongoose')
const helpers = require('../utils/accountUtil')
const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    sex: {
        type: String,
        required: true
    },
    sexPref: {
        type: [String],
        required: true
    },
    ageRange: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        }
    },
    location: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    filters: [mongoose.Schema.Types.ObjectId],
    hobbies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Hobby'
        }
    ],
    hobbyCustom: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            image: String,
            description: String
        }
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }]
})

const findByEmail = email =>
    new Promise((resolve, reject) => Account.findOne({email: email}, (err, data) =>
        err ? reject(new Error(err)) : resolve(data)))

const countEmails = email =>
    new Promise((resolve, reject) => Account.count({email: email}, (err, count) =>
        err ? reject(new Error(err)) : resolve(count)))

const calcPopularity = account =>
    account.hobbies.reduce((popularity, hobby) =>
        popularity + (hobby.hobby.popularity / account.hobbies.length))

const countUsersOnHobbies = id =>
    new Promise((resolve, reject) => Account.count({ hobbies: { _id: id } }, (err, data) =>
        err ? reject(new Error(err)) : resolve(data)))

const fetchAllUsers = () =>
    new Promise((resolve, reject) =>
        Account.find({})
            .populate('hobbies')
            .exec((err, data) => {
                if (err) reject(new Error(err))
                try {
                    const users = data.map(user => helpers.compress.hobbies(user))
                    resolve(users)
                } catch (err) {
                    reject(new Error(err))
                }
            }))

const fetchUser = id =>
    new Promise((resolve, reject) =>
        Account.findOne({_id: id})
            .populate('hobbies')
            .exec((err, data) => {
                if (err) reject(new Error(err))
                try {
                    data = helpers.compress.hobbies(data)
                    resolve(data)
                } catch (err) {
                    reject(new Error(err))
                }
            }))

const processUserList = (loggedInUser, users) =>
    new Promise((resolve, reject) => {
        try {
            const usersWithoutLoggedInUser = helpers.filter.loggedIn(loggedInUser, users)
            const usersWithoutDislikedUser = helpers.filter.withDislikes(loggedInUser, usersWithoutLoggedInUser)
            const usersOnRightGender = helpers.filter.sex(loggedInUser, usersWithoutDislikedUser)
            const sortedUsers = helpers.sort.popularity(helpers.sort.likes(loggedInUser, usersOnRightGender))
            const usersWithinAgeRange = helpers.filter.ageRange(loggedInUser, sortedUsers)
            resolve(usersWithinAgeRange)
        } catch (err) {
            reject(new Error(err))
        }
    })

const Account = mongoose.model('Account', schema)

module.exports = Account
module.exports.findByEmail = findByEmail
module.exports.countEmails = countEmails
module.exports.calcPopularity = calcPopularity
module.exports.countUsersOnHobbies = countUsersOnHobbies
module.exports.fetchUser = fetchUser
module.exports.fetchAllUsers = fetchAllUsers
module.exports.processUserList = processUserList
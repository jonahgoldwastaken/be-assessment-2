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
        type: String,
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
    likes: [mongoose.Schema.Types.ObjectId],
    dislikes: [mongoose.Schema.Types.ObjectId]
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
                    const users = data.map(async user => {
                        const compressedUser = await helpers.compress.hobbies(user)
                        return compressedUser
                    })
                    resolve(users)
                } catch (err) {
                    reject(new Error(err))
                }
            }))

const fetchUser = id =>
    new Promise((resolve, reject) =>
        Account.findOne({_id: id})
            .populate('hobbies')
            .exec(async (err, data) => {
                if (err) reject(new Error(err))
                try {
                    data = await helpers.compress.hobbies(data)
                    resolve(data)
                } catch (err) {
                    reject(new Error(err))
                }
            }))

const processUserList = (loggedInUser, users) =>
    new Promise((resolve, reject) => {
        try {
            const usersWithoutLoggedInUser = helpers.filter.loggedInUser(loggedInUser, users)
            const usersWithoutDislikedUser = helpers.filter.usersWithDislikes(loggedInUser, usersWithoutLoggedInUser)
            const usersWithSortedLikesAndPopularity = helpers.sort.onPopularity(helpers.sort.onLikes(loggedInUser, usersWithoutDislikedUser))
            const usersWithinAgeRange = helpers.filter.ageRange(loggedInUser, usersWithSortedLikesAndPopularity)
            resolve(usersWithinAgeRange)
        } catch (err) {
            reject(new Error(err))
        }
    })

const Account = mongoose.model('Account', schema)

Account.findByEmail = findByEmail
Account.countEmails = countEmails
Account.calcPopularity = calcPopularity
Account.countUsersOnHobbies = countUsersOnHobbies
Account.fetchUser = fetchUser
Account.fetchAllUsers = fetchAllUsers
Account.processUserList = processUserList

module.exports = Account
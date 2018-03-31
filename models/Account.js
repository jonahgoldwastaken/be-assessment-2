const mongoose = require('mongoose')
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
    location: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    filters: [mongoose.Schema.Types.ObjectId],
    hobbies: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        image:  String,
        description: String
    }],
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
    new Promise((resolve, reject) => Account.count({ hobbies: { hobby: id } }, (err, data) =>
        err ? reject(new Error(err)) : resolve(data)))

const Account = mongoose.model('Account', schema)

Account.findByEmail = findByEmail
Account.countEmails = countEmails
Account.calcPopularity = calcPopularity
Account.countUsersOnHobbies = countUsersOnHobbies

module.exports = Account
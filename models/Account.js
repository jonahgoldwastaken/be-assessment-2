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
        hobby: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        image:  String,
        description: String
    }],
    likes: [mongoose.Schema.Types.ObjectId],
    dislikes: [mongoose.Schema.Types.ObjectId]
})

const Account = mongoose.model('Account', schema)

Account.getPopularity = account =>
    account.hobbies.reduce((popularity, hobby) => popularity + hobby.hobby.popularity) / account.hobbies.length

Account.countUsersOnHobbies = (id, cb) => 
    Account.count({ hobbies: { hobby: id } }, cb)

module.exports = Account
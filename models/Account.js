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

const compressHobbies = user => {
    user.hobbies.forEach(hobby => {
        if (hobby._id in user.hobbyCustom) {
            const customHobby = user.hobbyCustom[hobby._id]
            hobby.image = customHobby.image
            hobby.description = customHobby.description
        }
    })
    return user
}

const fetchUser = id =>
    new Promise((resolve, reject) =>
        Account.findOne({_id: id})
            .populate({
                path: 'hobbies',
                select: 'name image'
            })
            .exec((err, data) => {
                if (err)
                    reject(new Error(err))
                data = compressHobbies(data)
                resolve(data)
            }))

const Account = mongoose.model('Account', schema)

Account.findByEmail = findByEmail
Account.countEmails = countEmails
Account.calcPopularity = calcPopularity
Account.countUsersOnHobbies = countUsersOnHobbies
Account.fetchUser = fetchUser

module.exports = Account
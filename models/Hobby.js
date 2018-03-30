const mongoose = require('mongoose')
const Account = require('./Account')
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    popularity: {
        type: Number,
        default: 0,
        required: false
    }
})

const calculatePopularity = () =>
    new Promise(async (resolve, reject) => {
        const hobbies = await Hobby.findAllHobbies().catch(reject)
        hobbies.forEach(async (hobby, i) => {
            hobby.popularity = await Account.countUsersOnHobbies(hobby.id).catch(console.error)
            await Hobby.updateHobby(hobby.id, hobby).catch(reject)
            if (i == hobbies.length - 1) resolve()
        })
    })

const updateHobby = (id, hobby) =>
    new Promise((resolve, reject) =>
        this.model('Hobby').findByIdAndUpdate(hobby.id, hobby, (err, data) =>
            err ? reject(err) : resolve(data)))

const findAllHobbies = () =>
    new Promise((resolve, reject) =>
        Hobby.find({}, (err, hobbies) =>
            err ? reject(err) : resolve(hobbies)))

const findAllAndSort = () =>
    new Promise((resolve, reject) =>
        Hobby.find({}, (err, hobbies) =>
            err ? reject(err)
                : resolve(hobbies.sort((a, b) =>
                    a.popularity < b.popularity))))

const Hobby = mongoose.model('Hobby', schema)

Hobby.calculatePopularity = calculatePopularity
Hobby.updateHobby = updateHobby
Hobby.findAllHobbies = findAllHobbies
Hobby.findAllAndSort = findAllAndSort

module.exports = Hobby
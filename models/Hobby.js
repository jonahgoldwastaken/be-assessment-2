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
    popularity: Number
})

const Hobby = mongoose.model('Hobby', schema)

Hobby.calculatePopularity = () =>
    new Promise(async (resolve, reject) => {
        const hobbies = await Hobby.findAllHobbies().catch(err => reject(err))
        hobbies.forEach(async (hobby, i) => {
            hobby.popularity = await Account.countUsersOnHobbies(hobby.id).catch(err => console.error(err))
            await Hobby.updateHobby(hobby.id, hobby).catch(err => reject(err))
            if (i == hobbies.length - 1) resolve()
        })
    })

Hobby.updateHobby = (id, hobby) =>
    new Promise((resolve, reject) =>
        this.model('Hobby').findByIdAndUpdate(hobby.id, hobby, (err, data) =>
            err ? reject(err) : resolve(data)))

Hobby.findAllHobbies = () =>
    new Promise((resolve, reject) =>
        Hobby.find({}, (err, hobbies) =>
            err ? reject(err) : resolve(hobbies)))

Hobby.findAllAndSort = () =>
    new Promise((resolve, reject) =>
        Hobby.find({}, (err, hobbies) =>
            err ? reject(err)
                : resolve(hobbies.sort((a, b) =>
                    a.popularity < b.popularity))))

module.exports = Hobby
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
    new Promise((resolve, reject) =>
        Hobby.findAllHobbies()
            .then(hobbies =>
                hobbies.forEach((hobby, i) =>
                    new Promise((resolve, reject) =>
                        Account.countUsersOnHobbies(hobby.id, (err, count) => {
                            if (err) reject(err)
                            hobby.popularity = count
                            Hobby.updateHobby(hobby.id, hobby)
                                .then(() => resolve(i))
                                .catch(err => reject(err))
                        }))
                        .then(i => i == hobbies.length - 1 && resolve())
                        .catch(err => reject(err))))
            .catch(err => reject(err)))

Hobby.updateHobby = (id, hobby) =>
    new Promise((resolve, reject) =>
        this.model('Hobby').findByIdAndUpdate(hobby.id, hobby, (err, data) =>
            err
                ? reject(err)
                : resolve(data)))

Hobby.findAllHobbies = () =>
    new Promise((resolve, reject) =>
        Hobby.find({}, (err, hobbies) =>
            err
                ? reject(err)
                : resolve(hobbies)))

Hobby.findAllAndSort = () =>
    new Promise((resolve, reject) =>
        Hobby.find({}, (err, hobbies) =>
            err
                ? reject(err)
                : resolve(hobbies.sort((a, b) => a.popularity < b.popularity))))

module.exports = Hobby
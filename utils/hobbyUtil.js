const Hobby = require('../models/Hobby')

const sortHobbies = hobbies =>
    hobbies.sort((a, b) =>
        a.popularity < b.popularity)

const findAllHobbies = () =>
    new Promise((resolve, reject) =>
        Hobby.find({}, (err, hobbies) =>
            (err ? reject(err)
                : resolve(sortHobbies(hobbies)))))

module.exports = {
    find: {
        all: findAllHobbies
    },
    sort: {
        popularity: sortHobbies
    }
}

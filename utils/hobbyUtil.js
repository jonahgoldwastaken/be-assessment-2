const Hobby = require('../models/Hobby')
const account = require('./accountUtil')

/**
 * Filter out hobbies that a user already has.
 * @param {HobbyModel} hobbies standard list of hobbies from db.
 * @param {Account} user user document
 * @returns {Hobby[]}
 */
const filterHobbiesOnUser = (hobbies, { hobbies: userHobbies }) => {
    const userHobbyIds = userHobbies.map(hobby => hobby._id)
    return hobbies.filter(hobby =>
        !(userHobbyIds.some(id => (hobby._id.equals(id)))))
}

/**
 * Calculates popularity based on the percentage of people using that particular hobby.
 * @param {Hobby[]} hobbies standard list of hobbies
 * @returns {Hobby[]} hobbies with popularities
 */
const calculatePopularity = async (hobbies) => {
    const promises = hobbies.map(async (hobby) => {
        try {
            const popularity = (await account.count.hobbies(hobby._id)
                / await account.count.all()) * 100
            const parsedHobby = hobby
            parsedHobby.popularity = popularity
            return parsedHobby
        } catch (err) {
            throw err
        }
    })
    const processedHobbies = await Promise.all(promises)
    return processedHobbies
}

/**
 * Sorts the hobbies on popularity.
 * @param {Hobby[]} hobbies hobbies with popularity property
 * @returns {Hobby[]}
 */
const sortHobbies = hobbies =>
    hobbies.sort((a, b) =>
        a.popularity < b.popularity)

/**
 * Fetches all Hobby documents from DB and parses them.
 * @returns {Hobby[]} sorted Hobby documents with popularity property.
 */
const findAllHobbies = () =>
    new Promise((resolve, reject) =>
        Hobby.find({}, async (err, hobbies) => {
            if (err) reject(err)
            const parsedHobbies = await calculatePopularity(hobbies)
            const sortedHobbies = sortHobbies(parsedHobbies)
            resolve(sortedHobbies)
        }))

/**
 * Combines the provided properties within the hobby
 * @param {Hobby} hobby A Hobby document
 * @param {Object} props Object with custom properties
 * @return {Hobby} Object with custom properties
 */
const compressCustomProperties = (hobby, props) => ({
    _id: hobby._id,
    name: hobby.name,
    image: (props && props.image) || hobby.image,
    description: (props && props.description)
})

/**
 * Fetches one Hobby document with the provided ID
 * @param {String} _id Hobby document ID
 * @returns {Hobby} Hobby document fetched with ID
 */
const findById = _id =>
    new Promise((resolve, reject) =>
        Hobby.findOne({ _id }, (err, hobby) => {
            if (err) reject(err)
            resolve(hobby)
        }))

/**
 * Creates a new Hobby document based on provided data
 * @param {Object} data Object with data to put into Hobby object
 * @returns {Hobby} New Hobby document
 */
const newHobby = data =>
    new Hobby(data)

module.exports = {
    find: {
        all: findAllHobbies,
        id: findById
    },
    sort: {
        popularity: sortHobbies
    },
    filter: {
        user: filterHobbiesOnUser
    },
    compress: {
        properties: compressCustomProperties
    },
    new: newHobby
}

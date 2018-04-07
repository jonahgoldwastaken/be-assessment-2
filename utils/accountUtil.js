const Account = require('../models/Account')

/**
 * Compresses hobbies, combining an image and description with corresponding hobby
 * @param {Account} user Account model
 * @returns {Account} Compressed account model
 */
const compressHobbies = (user) => {
    try {
        user.hobbies.map((hobby) => {
            if (user.hobbyCustom && hobby._id in user.hobbyCustom) {
                const customHobby = user.hobbyCustom[hobby._id]
                return {
                    name: hobby.name,
                    image: customHobby.image,
                    description: customHobby.description
                }
            }
            return hobby
        })
        return user
    } catch (err) {
        throw err
    }
}

/**
 * Calculates popularity based on the popularity per hobby
 * @param {Account} account Account model
 * @returns {Account} Account model with popularity
 */
const calcPopularity = account =>
    account.hobbies.reduce((popularity, hobby) =>
        popularity + (hobby.hobby.popularity / account.hobbies.length))

/**
 * Fetches user based on provided e-mail address
 * @param {String} email
 * @returns {Promise} Promise resolving to Account model
 */
const findByEmail = email =>
    new Promise((resolve, reject) => Account.findOne({ email }, (err, data) =>
        (err ? reject(new Error(err)) : resolve(data))))

/**
 * Fetches all users and compresses them
 * @returns {Promise} Promise resolving to list of compressed Account models
 */
const fetchAllUsers = () =>
    new Promise((resolve, reject) =>
        Account.find({})
            .populate('hobbies')
            .exec((err, data) => {
                if (err) reject(new Error(err))
                try {
                    const users = data.map(user => compressHobbies(user))
                    resolve(users)
                } catch (error) {
                    reject(new Error(error))
                }
            }))

/**
 * Finds and compresses a user
 * @param {String} id An Account model ID
 * @returns {Promise} Promise resolving to compressed Account model
 */
const findById = id =>
    new Promise((resolve, reject) =>
        Account.findOne({ _id: id })
            .populate('hobbies')
            .exec((err, data) => {
                if (err) reject(new Error(err))
                try {
                    const parsedData = compressHobbies(data)
                    resolve(parsedData)
                } catch (error) {
                    reject(new Error(error))
                }
            }))

/**
 * Counts the amount of records inside the database
 * @returns {Promise} Promise resolving to corresponding amount of Account models
 */
const countUsers = () =>
    new Promise((resolve, reject) => Account.count({}, (err, count) =>
        (err ? reject(new Error(err)) : resolve(count))))

/**
 * Counts the amount of users with the same e-mail address
 * @param {String} email
 * @returns {Promise} Promise resolving to corresponding amount of Account models
 */
const countEmails = email =>
    new Promise((resolve, reject) => Account.count({ email }, (err, count) =>
        (err ? reject(new Error(err)) : resolve(count))))

/**
 * Counts the amount of users who have a certain hobby
 * @param {String} id A hobby ID
 * @returns {Promise} Promise resolving to corresponding amount of Account models
 */
const countUsersOnHobbies = id =>
    new Promise((resolve, reject) => Account.count({ hobbies: { _id: id } }, (err, data) =>
        (err ? reject(new Error(err)) : resolve(data))))

/**
 * Sorts lists of users based on if they like the comparing user.
 * @param {Account} user Account model to compare to
 * @param {Account[]} users All other Account models
 * @returns {Account[]} Sorted list of Account models
 */
const sortUsersOnLikes = (user, users) =>
    users.sort(currentUser =>
        (!!currentUser.likes && user.id in currentUser.likes))

/**
 * Sorts list of users on its popularity
 * @param {Account[]} users List of Account models
 * @returns {Account[]} Sorted list of Account models
 */
const sortOnPopularity = users =>
    users.sort((a, b) =>
        calcPopularity(a) > calcPopularity(b))

/**
 * Filters users on whether they disliked the comparing user.
 * @param {Account} user Account model to compare to
 * @param {Account[]} users All other Account models
 * @returns {Account[]} Filtered list of Account models
 */
const filterUsersWithDislikes = (user, users) =>
    users.filter(currentUser =>
        !(currentUser.dislikes && user in currentUser.dislikes))

/**
 * Filters logged in user from Account list
 * @param {Account} user Logged in user
 * @param {Account[]} users All Account models fro mDB
 * @returns {Account[]} Filtered list of Account models
 */
const filterLoggedInUser = (user, users) =>
    users.filter(currentUser =>
        !(user._id.equals(currentUser._id)))

/**
 * Filters on age range
 * @param {Account} user Account models to compare to
 * @param {Account[]} users All other Account models
 * @returns {Account[]} Filtered list of Account models
 */
const filterAgeRange = (user, users) =>
    users.filter(currentUser =>
        (currentUser.age >= user.ageRange.min && currentUser.age <= user.ageRange.max))

/**
 * Filters on sexual preference
 * @param {Account} user Account model to compare to
 * @param {Account[]} users All other Account models
 * @returns {Account[]} Filtered list of Account models
 */
const filterSex = (user, users) =>
    users.filter(currentUser =>
        !(currentUser.sex in user.sexPref))

/**
 * Process all users for the matching system to work it's magic.
 * @param {Account} loggedInUser Logged in user
 * @param {Account[]} users All Account models from DB
 * @returns {Account[]} Processed list of Account models
 */
const processUserList = (loggedInUser, users) =>
    new Promise((resolve, reject) => {
        try {
            const usersWithoutLoggedInUser = filterLoggedInUser(loggedInUser, users)
            const usersWithoutDislikedUser =
                filterUsersWithDislikes(loggedInUser, usersWithoutLoggedInUser)
            const usersOnRightGender = filterSex(loggedInUser, usersWithoutDislikedUser)
            const sortedUsers = sortOnPopularity(sortUsersOnLikes(loggedInUser, usersOnRightGender))
            const usersWithinAgeRange = filterAgeRange(loggedInUser, sortedUsers)
            resolve(usersWithinAgeRange)
        } catch (err) {
            reject(new Error(err))
        }
    })

/**
 * Returns if user has a session
 * @param {Request} req Express Request
 */
const isUserLoggedIn = ({ session: { userId } }) => !!userId

/**
 * Fetches logged in user with session id
 * @param {Request} req Express Request
 */
const getLoggedInUser = ({ session: { userId } }) =>
    new Promise(async (resolve, reject) => {
        try {
            const user = await findById(userId)
            resolve(user)
        } catch (err) {
            reject(new Error(err))
        }
    })

/**
 * Sets user session
 * @param {Request} req Express Request
 * @param {String} id Account model ID
 */
const logInUser = (req, id) => { req.session.userId = id }

/**
 * Destroys user session
 * @param {Request} req Express Request
 */
const logOutUser = ({ session: { destroy } }) => destroy()

/**
 * Creates a new Account model based on provided data
 * @param {Object} data Object with data to put into Account object
 */
const newAccount = data =>
    new Account(data)

module.exports = {
    find: {
        all: fetchAllUsers,
        byEmail: findByEmail,
        byId: findById
    },
    count: {
        all: countUsers,
        emails: countEmails,
        hobbies: countUsersOnHobbies
    },
    process: {
        list: processUserList
    },
    filter: {
        loggedIn: filterLoggedInUser,
        withDislikes: filterUsersWithDislikes,
        ageRange: filterAgeRange,
        sex: filterSex
    },
    sort: {
        likes: sortUsersOnLikes,
        popularity: sortOnPopularity
    },
    compress: {
        hobbies: compressHobbies
    },
    currentUser: {
        isLoggedIn: isUserLoggedIn,
        get: getLoggedInUser,
        logIn: logInUser,
        logOut: logOutUser
    },
    new: newAccount
}

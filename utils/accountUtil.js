const Account = require('../models/Account')

/**
 * Compresses hobbies, combining an image and description with corresponding hobby
 * @param {Account} user Account document
 * @returns {Account} Compressed account document
 */
const compressHobbies = (user) => {
    try {
        const parsedHobbies = user.hobbies.map((hobby) => {
            const i = user.hobbyCustom.findIndex(customProperties =>
                hobby._id.equals(customProperties._id))
            if (i !== -1) {
                const customHobby = user.hobbyCustom[i]
                return {
                    _id: hobby._id,
                    name: hobby.name,
                    image: customHobby.image || hobby.image,
                    description: customHobby.description
                }
            }
            return hobby
        })
        user.hobbies = parsedHobbies
        return user
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * Calculates popularity based on the popularity per hobby
 * @param {Account} account Account document
 * @returns {Account} Account document with popularity
 */
const calcPopularity = account =>
    account.hobbies.reduce((popularity, hobby) =>
        popularity + (hobby.hobby.popularity / account.hobbies.length))

/**
 * Fetches user based on provided e-mail address
 * @param {String} email
 * @returns {Promise} Promise resolving to Account document
 */
const findByEmail = email =>
    new Promise((resolve, reject) => Account.findOne({ email }, (err, data) =>
        (err ? reject(new Error(err)) : resolve(data))))

/**
 * Fetches all users and compresses them
 * @returns {Promise} Promise resolving to list of compressed Account documents
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
 * @param {String} id An Account document ID
 * @returns {Promise} Promise resolving to compressed Account document
 */
const findById = _id =>
    new Promise((resolve, reject) =>
        Account.findOne({ _id })
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
 * Finds a user without compressing it
 * @param {String} id An Account document ID
 */
const findByIdWithoutHobbbies = id =>
    new Promise((resolve, reject) =>
        Account.findOne({ _id: id }, (err, data) => {
            if (err) reject(new Error(err))
            resolve(data)
        }))
/**
 * Counts the amount of records inside the database
 * @returns {Promise} Promise resolving to corresponding amount of Account documents
 */
const countUsers = () =>
    new Promise((resolve, reject) => Account.count({}, (err, count) =>
        (err ? reject(new Error(err)) : resolve(count))))

/**
 * Counts the amount of users with the same e-mail address
 * @param {String} email
 * @returns {Promise} Promise resolving to corresponding amount of Account documents
 */
const countEmails = email =>
    new Promise((resolve, reject) => Account.count({ email }, (err, count) =>
        (err ? reject(new Error(err)) : resolve(count))))

/**
 * Counts the amount of users who have a certain hobby
 * @param {String} id A hobby ID
 * @returns {Promise} Promise resolving to corresponding amount of Account documents
 */
const countUsersOnHobbies = id =>
    new Promise((resolve, reject) => Account.count({ hobbies: { _id: id } }, (err, data) =>
        (err ? reject(new Error(err)) : resolve(data))))

/**
 * Sorts lists of users based on if they like the comparing user.
 * @param {Account} user Account document to compare to
 * @param {Account[]} users All other Account documents
 * @returns {Account[]} Sorted list of Account documents
 */
const sortUsersOnLikes = (user, users) =>
    users.sort(currentUser =>
        (currentUser.likes.some(like =>
            user._id.equals(like))))

/**
 * Sorts list of users on its popularity
 * @param {Account[]} users List of Account documents
 * @returns {Account[]} Sorted list of Account documents
 */
const sortOnPopularity = users =>
    users.sort((a, b) =>
        calcPopularity(a) > calcPopularity(b))

const filterLiked = (user, users) =>
    users.filter(currentUser =>
        !(user.likes.some(like =>
            like.equals(currentUser._id))))

const filterDisliked = (user, users) =>
    users.filter(currentUser =>
        !(user.dislikes.some(dislike =>
            dislike.equals(currentUser._id))))

const filterMatched = (user, users) =>
    users.filter(currentUser =>
        !(user.matches.some(match =>
            match.equals(currentUser._id))))

/**
 * Filters users on whether they disliked the comparing user.
 * @param {Account} user Account document to compare to
 * @param {Account[]} users All other Account documents
 * @returns {Account[]} Filtered list of Account documents
 */
const filterUsersWithDisliked = (user, users) =>
    users.filter(currentUser =>
        !(currentUser.dislikes.some(dislike =>
            dislike.equals(user._id))))

/**
 * Filters logged in user from Account list
 * @param {Account} user Logged in user
 * @param {Account[]} users All Account documents fro mDB
 * @returns {Account[]} Filtered list of Account documents
 */
const filterLoggedInUser = (user, users) =>
    users.filter(currentUser =>
        !(user._id.equals(currentUser._id)))

/**
 * Filters on age range
 * @param {Account} user Account documents to compare to
 * @param {Account[]} users All other Account documents
 * @returns {Account[]} Filtered list of Account documents
 */
const filterAgeRange = (user, users) =>
    users.filter(currentUser =>
        (currentUser.age >= user.ageRange.min && currentUser.age <= user.ageRange.max))

/**
 * Filters on sexual preference
 * @param {Account} user Account document to compare to
 * @param {Account[]} users All other Account documents
 * @returns {Account[]} Filtered list of Account documents
 */
const filterSex = (user, users) =>
    users.filter(currentUser =>
        !(currentUser.sex in user.sexPref))

/**
 * Process all users for the matching system to work it's magic.
 * @param {Account} loggedInUser Logged in user
 * @param {Account[]} users All Account documents from DB
 * @returns {Account[]} Processed list of Account documents
 */
const processUserList = (loggedInUser, users) => /* eslint-disable function-paren-newline */
    new Promise((resolve, reject) => {
        try {
            const processedUsers =
                sortOnPopularity(
                    sortUsersOnLikes(loggedInUser,
                        filterAgeRange(loggedInUser,
                            filterSex(loggedInUser,
                                filterUsersWithDisliked(loggedInUser,
                                    filterMatched(loggedInUser,
                                        filterDisliked(loggedInUser,
                                            filterLiked(loggedInUser,
                                                filterLoggedInUser(loggedInUser, users)))))))))
            resolve(processedUsers)
        } catch (err) {
            reject(new Error(err))
        }
    })

/**
 * Updates two accounts, removing like entry and adding corresponding IDs to matches
 * @param {Account} loggedInUser Logged in Account document
 * @param {String} matchId Account document ID from matched account
 */
const processMatch = (loggedInUser, matchId) =>
    new Promise(async (resolve, reject) => {
        try {
            const match = await findById(matchId)
            const iOne = loggedInUser.likes.findIndex(like => like.equals(matchId))
            const iTwo = match.likes.findIndex(like => like.equals(loggedInUser._id))
            loggedInUser.likes.splice(iOne, 1)
            match.likes.splice(iTwo, 1)
            loggedInUser.matches.push(matchId)
            match.matches.push(loggedInUser._id)
            await loggedInUser.update(loggedInUser)
            await match.update(match)
            resolve()
        } catch (err) {
            reject(new Error(err))
        }
    })

/**
 * Checks if certain person likes logged in user.
 * @param {String} id Logged in Account document ID
 * @param {String} userId Account document ID to check for likes
 */
const checkForMatch = ({ _id: id }, userId) =>
    new Promise(async (resolve, reject) => {
        try {
            const { likes: likesToCheck } = await findByIdWithoutHobbbies(userId)
            if (!likesToCheck.length) resolve(false)
            else resolve(likesToCheck.some(like => like.equals(id)))
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

const getLoggedInUserWithoutHobbies = ({ session: { userId } }) =>
    new Promise(async (resolve, reject) => {
        try {
            const user = await findByIdWithoutHobbbies(userId)
            resolve(user)
        } catch (err) {
            reject(new Error(err))
        }
    })

/**
 * Sets user session
 * @param {Request} req Express Request
 * @param {String} id Account document ID
 */
const logInUser = (req, id) => { req.session.userId = id }

/**
 * Destroys user session
 * @param {Request} req Express Request
 */
const logOutUser = ({ session: { destroy } }) => destroy()

/**
 * Creates a new Account document based on provided data
 * @param {Object} data Object with data to put into Account object
 */
const newAccount = data =>
    new Account(data)

module.exports = {
    checkMatch: checkForMatch,
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
        list: processUserList,
        match: processMatch
    },
    filter: {
        loggedIn: filterLoggedInUser,
        withDisliked: filterUsersWithDisliked,
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
        getWithoutHobbies: getLoggedInUserWithoutHobbies,
        logIn: logInUser,
        logOut: logOutUser
    },
    new: newAccount
}

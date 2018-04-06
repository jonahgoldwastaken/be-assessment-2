const Account = require('../models/Account')

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

/*
    LOGIC HELPERS
*/
const calcPopularity = account =>
    account.hobbies.reduce((popularity, hobby) =>
        popularity + (hobby.hobby.popularity / account.hobbies.length))

const findByEmail = email =>
    new Promise((resolve, reject) => Account.findOne({ email }, (err, data) =>
        (err ? reject(new Error(err)) : resolve(data))))

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

const countUsers = () =>
    new Promise((resolve, reject) => Account.count({}, (err, count) =>
        (err ? reject(new Error(err)) : resolve(count))))

const countEmails = email =>
    new Promise((resolve, reject) => Account.count({ email }, (err, count) =>
        (err ? reject(new Error(err)) : resolve(count))))

const countUsersOnHobbies = id =>
    new Promise((resolve, reject) => Account.count({ hobbies: { _id: id } }, (err, data) =>
        (err ? reject(new Error(err)) : resolve(data))))

const sortUsersOnLikes = (user, users) =>
    users.sort(currentUser =>
        (!!currentUser.likes && user.id in currentUser.likes))

const sortOnPopularity = users =>
    users.sort((a, b) =>
        calcPopularity(a) > calcPopularity(b))

const filterUsersWithDislikes = (user, users) =>
    users.filter(currentUser =>
        !(currentUser.dislikes && user in currentUser.dislikes))

const filterLoggedInUser = (user, users) =>
    users.filter(currentUser =>
        !(user._id.equals(currentUser._id)))

const filterAgeRange = (user, users) =>
    users.filter(currentUser =>
        (currentUser.age >= user.ageRange.min && currentUser.age <= user.ageRange.max))

const filterSex = (user, users) =>
    users.filter(currentUser =>
        !(currentUser.sex in user.sexPref))

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

const getLoggedInUser = req =>
    new Promise(async (resolve, reject) => {
        try {
            const user = await findById(req.session.userId)
            resolve(user)
        } catch (err) {
            reject(new Error(err))
        }
    })

const isUserLoggedIn = req => !!req.session.userId
const logInUser = (req, id) => { req.session.userId = id }
const logOutUser = req => req.session.destroy()

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
    }
}

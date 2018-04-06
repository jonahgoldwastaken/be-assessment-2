const Account = require('../models/Account')

const sortUsersOnLikes = (user, users) =>
    users.sort(currentUser => (!!currentUser.likes && user.id in currentUser.likes))

const sortOnPopularity = users =>
    users.sort((a, b) => a.popularity > b.popularity)

const filterUsersWithDislikes = (user, users) =>
    users.filter(currentUser => {
        if (currentUser.dislikes && user in currentUser.dislikes) return 0
        else if (currentUser.dislikes && !(user in currentUser.dislikes)) return 1
        else if (!currentUser.dislikes) return 1
    })

const filterLoggedInUser = (user, users) =>
    users.filter(currentUser =>
        !(user._id.equals(currentUser._id)))

const filterAgeRange = (user, users) =>
    users.filter(currentUser =>
        (currentUser.age >= user.ageRange.min && currentUser.age <= user.ageRange.max))

const filterSex = (user, users) =>
    users.filter(currentUser =>
        !(currentUser.sex in user.sexPref))

const compressHobbies = user => {
    try {
        user.hobbies.forEach(hobby => {
            if (user.hobbyCustom && hobby._id in user.hobbyCustom) {
                const customHobby = user.hobbyCustom[hobby._id]
                hobby.image = customHobby.image
                hobby.description = customHobby.description
            }
        })
        return user
    } catch (err) {
        throw err
    }
}

const getLoggedInUser = req =>
    new Promise(async (resolve, reject) => {
        try {
            const user = await Account.fetchUser(req.session.userId)
            resolve(user)
        } catch (err) {
            reject(new Error(err))
        }
    })

const isUserLoggedIn = (req) => !!req.session.userId
const logInUser = (req, id) => void (req.session.userId = id)
const logOutUser = (req) => void req.session.destroy()

module.exports = {
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
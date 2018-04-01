const sortUsersOnLikes = (user, users) =>
    users.sort(currentUser => (!!currentUser.likes && user.id in currentUser.likes))

const sortOnPopularity = users =>
    users.sort((a, b) => a.popularity > b.popularity)

const filterUsersWithDislikes = (user, users) =>
    users.filter(currentUser => (!!currentUser.dislikes && user.id in currentUser.dislikes))

const filterLoggedInUser = (user, users) =>
    users.filter(currentUser => user != currentUser)

const filterAgeRange = (user, users) =>
    users.filter(currentUser =>
        currentUser.age >= user.ageRange.min && currentUser.age <= user.ageRange.max)

const compressHobbies = user => 
    new Promise((resolve, reject) => {
        try {
            user.hobbies.forEach(hobby => {
                if (user.hobbyCustom && hobby._id in user.hobbyCustom) {
                    const customHobby = user.hobbyCustom[hobby._id]
                    hobby.image = customHobby.image
                    hobby.description = customHobby.description
                }
            })
            resolve(user)
        } catch (err) {
            reject(new Error(err))
        }
    })

module.exports = {
    filter: {
        loggedInUser: filterLoggedInUser,
        usersWithDislikes: filterUsersWithDislikes,
        ageRange: filterAgeRange
    },
    sort: {
        onLikes: sortUsersOnLikes,
        onPopularity: sortOnPopularity
    },
    compress: {
        hobbies: compressHobbies
    }
}
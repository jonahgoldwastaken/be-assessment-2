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
    users.filter(currentUser => user != currentUser)

const filterAgeRange = (user, users) =>
    users.filter(currentUser => {
        if (currentUser.age >= user.ageRange.min && currentUser.age <= user.ageRange.max) return 1
        else return -1
    })

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
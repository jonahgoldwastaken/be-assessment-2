const mongoose = require('mongoose')
const accountUtil = require('../utils/accountUtil')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
})

schema.virtual('popularity').get(async () => {
    try {
        return await accountUtil.count.hobbies(this._id) / await accountUtil.count.all()
    } catch (err) {
        console.error(err)
        return false
    }
})

schema.set('toObject', { virtuals: true })
schema.set('toJSON', { virtuals: true })

const Hobby = mongoose.model('Hobby', schema)

module.exports = Hobby

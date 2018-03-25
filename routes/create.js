/* eslint-disable new-cap */
const router = require('express').Router()

const createAccount = (req, res) => {
    const step = req.params.step
    switch (step) {
        case 3:
            res.render('create-account/step-3')
            break
        case 2:
            res.render('create-account/step-2')
            break
        default:
            res.render('create-account/step-1')
            break
    }
}

module.exports = router
    .get('/:step', createAccount)

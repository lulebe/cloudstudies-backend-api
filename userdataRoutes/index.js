const bodyParser = require('body-parser')
const validator = require('express-validator')

const mw = require('../middleware')

const router = require('express').Router()

router.use(bodyParser.raw({type: '*/*'}))

router.get('/', [mw.auth], require('./getData'))
router.post('/', [mw.auth], require('./setData'))

module.exports = router
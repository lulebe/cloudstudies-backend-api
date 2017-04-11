const bodyParser = require('body-parser')
const validator = require('express-validator')

const router = require('express').Router()

const mw = require('../middleware')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: false}))
router.use(validator())


const signup = require('./signup')
const signin = require('./signin')
const updateuser = require('./updateuser')
const deleteuser = require('./deleteuser')
const pwreset = require('./pwreset')
const getinfo = require('./getinfo')
const decode = require('./decode')
const freename = require('./freename')
const getStores = require('./getStores')
const getOwnedStores = require('./getOwnedStores')
const search = require('./search')

router.post('/', signup)
router.post('/signin', signin)
router.put('/', [mw.auth], updateuser)
router.delete('/', [mw.auth], deleteuser)
router.post('/resetpw', pwreset)
router.post('/decode', decode)
router.get('/freename', freename)
router.get('/stores', [mw.auth], getStores)
router.get('/ownedStores', [mw.auth], getOwnedStores)
router.get('/search', [mw.auth], search)
router.get('/:id', [mw.auth], getinfo)

module.exports = router

const bodyParser = require('body-parser')
const validator = require('express-validator')

const router = require('express').Router()

const mw = require('../middleware')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: false}))
router.use(validator())

const createStore = require('./createStore')
const searchStores = require('./searchStores')
const getStore = require('./getStore')
const addFolder = require('./addFolder')
const addMember = require('./addMember')
const removeMember = require('./removeMember')

router.post('/stores', [mw.auth], createStore)
router.get('/stores', [mw.auth], searchStores)
router.get('/stores/:storeId', [mw.authOptional, mw.store], getStore)
router.post('/stores/:storeId/folders', [mw.auth, mw.store], addFolder)
router.post('/stores/:storeId/members', [mw.auth, mw.store], addMember)
router.delete('/stores/:storeId/members', [mw.auth, mw.store], removeMember)

module.exports = router

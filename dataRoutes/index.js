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
const getFileLink = require('./getFileLink')
const updateStore = require('./updateStore')
const deleteFile = require('./deleteFile')
const deleteFolder = require('./deleteFolder')
const moveFile = require('./moveFile')
const renameFile = require('./renameFile')

router.post('/stores', [mw.auth], createStore)
router.get('/stores', [mw.auth], searchStores)
router.get('/stores/:storeId', [mw.authOptional, mw.store], getStore)
router.put('/stores/:storeId', [mw.auth, mw.store], updateStore)
router.post('/stores/:storeId/members', [mw.auth, mw.store], addMember)
router.delete('/stores/:storeId/members', [mw.auth, mw.store], removeMember)
router.post('/stores/:storeId/folders', [mw.auth, mw.store], addFolder)
router.delete('/folder/:folderId', [mw.auth], deleteFolder)
router.get('/file/:fileId', [mw.authOptional], getFileLink)
router.delete('/file/:fileId', [mw.auth], deleteFile)
router.put('/file/:fileId/folder', [mw.auth], moveFile)
router.put('/file/:fileId/name', [mw.auth], renameFile)

module.exports = router

const bodyParser = require('body-parser')
const validator = require('express-validator')

const router = require('express').Router()

const mw = require('../middleware')

const addFile = require('./addFile')
const removeFile = require('./removeFile')
const getFileAccess = require('./getFileAccess')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: false}))
router.use(validator())

router.post('/fileadd/:folderId', [mw.internalAuth], addFile)
router.post('/filedelete/:fileId', [mw.internalAuth], removeFile)
router.post('/fileaccess/:fileId', [mw.internalAuth], getFileAccess)

module.exports = router

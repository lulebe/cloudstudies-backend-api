const bodyParser = require('body-parser')
const validator = require('express-validator')

const router = require('express').Router()

const mw = require('../middleware')

const addFile = require('./addFile')
const removeFile = require('./removeFile')
const removeFileForce = require('./removeFileForce')
const getFileAccess = require('./getFileAccess')
const getAllowedSize = require('./getAllowedSize')
const setFileSize = require('./setFileSize')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: false}))
router.use(validator())

router.post('/fileadd/:folderId', [mw.internalAuth], addFile)
router.post('/filedelete/:fileId', [mw.internalAuth], removeFile)
router.delete('/filedelete/:fileId', [mw.internalAuth], removeFileForce)
router.post('/fileaccess/:fileId', [mw.internalAuth], getFileAccess)
router.get('/allowedsize/:folderId', [mw.internalAuth], getAllowedSize)
router.post('/filesize/:fileId', [mw.internalAuth], setFileSize)

module.exports = router

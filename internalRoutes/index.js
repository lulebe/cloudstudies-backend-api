const bodyParser = require('body-parser')
const validator = require('express-validator')

const router = require('express').Router()

const mw = require('../middleware')

const addFile = require('./addFile')
const removeFile = require('./removeFile')
const removeFileForce = require('./removeFileForce')
const getFileAccess = require('./getFileAccess')
const getAllowedSize = require('./getAllowedSize')
const afterFileUpload = require('./afterFileUpload')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: false}))
router.use(validator())

router.post('/fileadd/:folderId', [mw.internalAuth], addFile)
router.post('/filedelete/:fileId', [mw.internalAuth], removeFile)
router.delete('/filedelete/:fileId', [mw.internalAuth], removeFileForce)
router.post('/fileaccess/:fileId', [mw.internalAuth], getFileAccess)
router.get('/allowedsize/:folderId', [mw.internalAuth], getAllowedSize)
router.post('/fileuploaded/:fileId', [mw.internalAuth], afterFileUpload)

module.exports = router

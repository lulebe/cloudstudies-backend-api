const crypto = require('crypto')
const Promise = require('bluebird')

const AppError = require('../error')
const helpers = require('../db/modelHelpers')
const File = require('../db/model').File
const Folder = require('../db/model').Folder
const Store = require('../db/model').Store
const User = require('../db/model').User

module.exports = (req, res) => {
  if (!req.body.storeAuthentication)
    return res.status(400).send('missing credentials')
  if (!req.body.fileName)
    return res.status(400).send('missing filename')
  if (req.body.userAuthentication)
    helpers.decodeJwt(req.body.userAuthentication, (err, user) => {
      if (err || !user)
        return addFile(res, req.body.fileName, req.params.folderId, req.body.storeAuthentication, null)
      return addFile(res, req.body.fileName, req.params.folderId, req.body.storeAuthentication, user)
    })
  else
    return addFile(res, req.body.fileName, req.params.folderId, req.body.storeAuthentication, null)
}

function addFile (res, fileName, folderId, storeAuthentication, user) {
  let folder = null
  let file = null
  return Folder.findById(folderId)
  .then(f => {
    if (!f)
      return Promise.reject(new AppError(404, 'folder not found'))
    folder = f
    return helpers.getStoreIfAllowed(folder.get('storeId'), storeAuthentication, user)
  })
  .then(() => {
    return Promise.fromNode(cb => crypto.randomBytes(32, cb))
  })
  .then(buf => {
    return File.create({name: fileName, salt: buf.toString('base64')})
  })
  .then(f => {
    file = f
    file.setFolder(folder)
  })
  .then(() => {
    res.status(201).send(file.toJSON())
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}
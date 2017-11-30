const crypto = require('crypto')
const Promise = require('bluebird')

const AppError = require('../error')
const helpers = require('../db/modelHelpers')
const File = require('../db/model').File
const Folder = require('../db/model').Folder
const Store = require('../db/model').Store
const User = require('../db/model').User
const config = require('../config.json')

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
  let store = null
  return Folder.findById(folderId)
  .then(f => {
    if (!f)
      return Promise.reject(new AppError(404, 'folder not found'))
    folder = f
    return helpers.getStoreIfAllowed(folder.get('storeId'), storeAuthentication, user)
  })
  .then(s => {
    store = s
    return Promise.fromNode(cb => crypto.randomBytes(32, cb))
  })
  .then(buf => {
    return File.create({name: fileName, salt: buf.toString('base64')})
  })
  .then(f => {
    file = f
    return file.setFolder(folder)
  })
  .then(() => {
    return file.setStore(store)
  })
  .then(() => {
    const fileResponse = file.toJSON()
    fileResponse.maxSize = config.maxStoreSize - store.size //max 3GB store size
    const authParts = storeAuthentication.split(' ')
    let auth
    if (authParts[0] == 'p')
      auth = crypto.createHash('sha256').update(authParts[1]+store.get('linkHash')).digest('hex')
    else
      auth = authParts[1]
    fileResponse.key = crypto.createHash('sha256').update(auth+file.get('salt')).digest('base64')
    res.status(201).send(fileResponse)
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}

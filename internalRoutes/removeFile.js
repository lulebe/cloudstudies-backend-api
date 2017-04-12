const Promise = require('bluebird')

const AppError = require('../error')
const helpers = require('../db/modelHelpers')
const File = require('../db/model').File
const Folder = require('../db/model').Folder
const Store = require('../db/model').Store
const User = require('../db/model').User

module.exports = (req, res) => {
  if (!req.body.storeAuthentication || !req.body.userAuthentication)
    return res.status(400).send('missing credentials')
  helpers.decodeJwt(req.body.userAuthentication, (err, user) => {
    if (err || !user)
      return res.status(403).send('no permission')
    return removeFile(res, req.params.fileId, req.body.storeAuthentication, req.body.fileSize || 0, user)
  })
}

function removeFile (res, fileId, storeAuthentication, fileSize, user) {
  let file = null
  File.findById(fileId)
  .then(f => {
    if (!f)
      return Promise.reject(new AppError(404, 'file not found'))
    file = f
    return file.getFolder()
  })
  .then(folder => {
    return helpers.getStoreIfAllowed(folder.get('storeId'), storeAuthentication, user)
  })
  .then(store => {
    if (store.ownerId != user.id)
      return Promise.reject(new AppError(403, 'no permission'))
    store.size -= fileSize
    if (store.size < 0)
      store.size = 0
    store.save()
    return file.destroy()
  })
  .then(() => {
    res.status(204).send()
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}
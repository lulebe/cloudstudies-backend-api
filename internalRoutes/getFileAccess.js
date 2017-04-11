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
  if (req.body.userAuthentication)
    helpers.decodeJwt(req.body.userAuthentication, (err, user) => {
      if (err || !user)
        return getAccess(res, req.params.fileId, req.body.storeAuthentication, null)
      return getAccess(res, req.params.fileId, req.body.storeAuthentication, user)
    })
  else
    return getAccess(res, req.params.fileId, req.body.storeAuthentication, null)
}

function getAccess (res, fileId, storeAuthentication, user) {
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
    res.status(200).send(file.toJSON())
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}
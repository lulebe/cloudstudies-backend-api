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
  let pw = null
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
    pw = buf
    return Promise.fromNode(cb => crypto.randomBytes(16, cb))
  })
  .then(buf => {
    let iv = buf.toString('base64')
    const authParts = storeAuthentication.split(' ')
    let auth
    if (authParts[0] == 'p')
      auth = authParts[1]+store.get('linkHash')
    else
      auth = authParts[1]
    auth = crypto.createHash('sha256').update(auth).digest()
    const cipher = crypto.createCipher('aes-256-cbc', auth)
    let pwenc = cipher.update(pw, '', 'base64')
    pwenc += cipher.final('base64')
    return File.create({name: fileName, password: pwenc, iv: iv})
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
    fileResponse.maxSize = store.maxSize - store.size
    delete fileResponse.password
    fileResponse.key = pw.toString('base64')
    res.status(201).send(fileResponse)
  })
  .catch(e => {
    console.log(e)
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}

const Promise = require('bluebird')

const AppError = require('../error')
const helpers = require('../db/modelHelpers')
const File = require('../db/model').File
const Folder = require('../db/model').Folder

module.exports = (req, res) => {
  const header = req.headers['x-store-auth']
  if (!header) return res.status(401).send('No store access header provided')
  let file = null
  File.findById(req.params.fileId)
  .then(f => {
    if (!f)
      return new AppError(404, 'file not found')
    file = f
    return helpers.getStoreIfAllowed(file.storeId, header, req.user)
  })
  .then(() => {
    file.name = req.body.newName
    return file.save()
  })
  .then(savedFile => {
    res.status(200).send()
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}

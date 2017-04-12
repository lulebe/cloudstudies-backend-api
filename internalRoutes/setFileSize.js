const Promise = require('bluebird')

const AppError = require('../error')
const helpers = require('../db/modelHelpers')
const File = require('../db/model').File
const Folder = require('../db/model').Folder
const Store = require('../db/model').Store

module.exports = (req, res) => {
  if (!req.body.fileSize)
    return res.status(400).send('no fileSize specified')
  File.findById(req.params.fileId)
  .then(file => {
    if (!file)
      return Promise.reject(new AppError(404, 'file not found'))
    return file.getFolder()
  })
  .then(folder => {
    return folder.getStore()
  })
  .then(store => {
    store.size += parseInt(req.body.fileSize)
    return store.save()
  })
  .then(() => {
    res.status(200).send()
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}
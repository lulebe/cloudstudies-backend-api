const Promise = require('bluebird')

const AppError = require('../error')
const Folder = require('../db/model').Folder
const config = require('../config.json')

module.exports = (req, res) => {
  return Folder.findById(req.params.folderId)
  .then(folder => {
    if (!folder)
      return Promise.reject(new AppError(404, 'folder not found'))
    return folder.getStore()
  })
  .then(store => {
    const maxSize = store.maxSize - store.size //max 3GB per Store
    res.status(200).send({maxSize})
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}

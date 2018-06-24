const Promise = require('bluebird')

const AppError = require('../error')
const File = require('../db/model').File

module.exports = (req, res) => {
  if (!req.body.previewFileCount)
      return res.status(400).send('no previewFileCount specified')
  File.findById(req.params.fileId)
  .then(file => {
    if (!file)
      return Promise.reject(new AppError(404, 'file not found'))
    file.previewFileCount = req.body.previewFileCount
    return file.save()
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
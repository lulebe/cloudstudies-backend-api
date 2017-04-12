const Promise = require('bluebird')

const AppError = require('../error')
const File = require('../db/model').File

module.exports = (req, res) => {
  File.findById(req.params.fileId)
  .then(file => {
    if (!file)
      return Promise.reject(new AppError(404, 'file not found'))
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
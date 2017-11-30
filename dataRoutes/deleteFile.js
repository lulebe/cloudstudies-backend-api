const Promise = require('bluebird')
const axios = require('axios')

const AppError = require('../error')
const helpers = require('../db/modelHelpers')
const File = require('../db/model').File

module.exports = (req, res) => {
  const header = req.headers['x-store-auth']
  if (!header) return res.status(401).send('No store access header provided')
  let file = null
  let store = null
  File.findById(req.params.fileId)
  .then(f => {
    if (!f)
      return new AppError(404, 'file not found')
    file = f
    return helpers.getStoreIfAllowed(file.storeId, header, req.user)
  })
  .then(s => {
    store = s
    axios({
      method: 'POST',
      url: process.env.UPLOAD_URL+'/internal/deleteFiles',
      headers: {Authorization: 'i '+process.env.INTERNAL_AUTH_KEY},
      data: {
        files: [file.id]
      }
    })
  })
  .then(() => {
    store.size = store.size - file.size
    return Promise.all([store.save(), file.destroy()])
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

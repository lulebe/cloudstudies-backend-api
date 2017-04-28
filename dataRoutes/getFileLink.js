const Promise = require('bluebird')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const config = require('../config.json')
const Store = require('../db/model').Store
const File = require('../db/model').File
const helpers = require('../db/modelHelpers')
const AppError = require('../error')

module.exports = (req, res) => {
  const header = req.headers['x-store-auth']
  if (!header) return res.status(401).send('No store access header provided')
  let file
  File.findById(req.params.fileId)
  .then(f => {
    if (!f)
      return Promise.reject(new AppError(404, 'file not found'))
    file = f
    return file.getFolder()
  })
  .then(folder => {
    return helpers.getStoreIfAllowed(folder.storeId, header, req.user)
  })
  .then(store => {
    const authParts = header.split(' ')
    let auth
    if (authParts[0] == 'p')
      auth = crypto.createHash('sha256').update(authParts[1]+store.get('linkHash')).digest('hex')
    else
      auth = authParts[1]
    const token = jwt.sign(
                    {
                      id: req.params.fileId,
                      auth: crypto.createHash('sha256').update(auth+file.get('salt')).digest('base64')
                    },
                    process.env.JWTFILES,
                    {expiresIn: 6000})
    res.status(200).send({token})
  })
  .catch(e => {
    console.log(e)
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}
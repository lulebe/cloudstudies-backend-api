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
    if (store.reencrypting)
      return res.status(409).send('reencrypting')
    const authParts = header.split(' ')
    let auth
    if (authParts[0] == 'p') {
      auth = crypto.createHash('sha256').update(authParts[1]+store.get('linkHash')).digest()
    } else
      auth = Buffer.from(authParts[1], 'hex')
    const decipher = crypto.createDecipher('aes-256-cbc', auth)
    const filekey = Buffer.concat([decipher.update(file.get('password'),'base64'), decipher.final()])
    const jwtData = {
      id: req.params.fileId,
      auth: filekey.toString('base64'),
      iv: file.get('iv'),
      authTag: file.get('authTag'),
      size: file.get('size')
    }
    const token = jwt.sign(
                    jwtData,
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

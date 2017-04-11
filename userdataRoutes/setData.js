const bcrypt = require('bcrypt')
const crypto = require('crypto')
const Promise = require('bluebird')

const AppError = require('../error')
const Userdata = require('../db/model').Userdata

module.exports = (req, res) => {
  if (!req.headers['x-user-pw'])
    return res.status(400).send('no password header provided')
  if (req.body.byteLength > 10240)
    return res.status(413).send('data too big')
  let salt = null
  let cipherKey = null
  let cipher = null
  let startpad = null
  Promise.fromNode(cb => crypto.randomBytes(32, cb))
  .then(saltBytes => {
    salt = saltBytes.toString('hex')
    cipherKey = crypto.createHash('sha256').update(req.headers['x-user-pw']+salt).digest('hex')
    cipher = crypto.createCipher('aes256', cipherKey)
    return Promise.fromNode(cb => crypto.randomBytes(1024, cb))
  })
  .then(b => {
    startpad = b
    return Promise.fromNode(cb => crypto.randomBytes(1024, cb))
  })
  .then(endpad => {
    const cbuf = Buffer.concat([startpad, req.body, endpad])
    const encrypted = Buffer.concat([cipher.update(cbuf),cipher.final()])
    return Userdata.upsert({userId: req.user.id, data: encrypted, salt: salt})
  })
  .then(() => {
    res.status(200).send(req.body)
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}

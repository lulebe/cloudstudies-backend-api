const bcrypt = require('bcrypt')
const crypto = require('crypto')
const Promise = require('bluebird')

const AppError = require('../error')

module.exports = (req, res) => {
  if (!req.headers['x-user-pw'])
    return res.status(400).send('no password header provided')
  req.user.getData()
  .then(userdata => {
    if (!userdata)
      return res.status(200).send(null)
    const cipherKey = crypto.createHash('sha256').update(req.headers['x-user-pw']+userdata.get('salt')).digest('hex')
    const decipher = crypto.createDecipher('aes256', cipherKey)
    let decrypted = Buffer.concat([decipher.update(userdata.data) , decipher.final()])
    decrypted = decrypted.slice(1024, decrypted.length-1024)
    res.status(200).send(decrypted)
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}

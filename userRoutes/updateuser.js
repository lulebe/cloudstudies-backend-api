const bcrypt = require('bcrypt')
const crypto = require('crypto')

const config = require('../config.json')
const AppError = require('../error')
const helpers = require('../db/modelHelpers')

module.exports = (req, res) => {
  if (!req.body.password && !req.body.email)
    return res.status(400).send('No changes provided')
  if (req.body.email)
    req.user.email = req.body.email
  if (req.body.password)
    bcrypt.hash(req.body.password, config.bcryptRounds, (err, pwhash) => {
      if (err)
        return new AppError(500, 'Password could not be hashed.')
      if (req.body.oldPassword) {
        //re-encrypt userdata
        req.user.getData().then(userdata => {
          if (!userdata) return
          const decipher = crypto.createDecipher('aes256', req.body.oldPassword)
          const decrypted = Buffer.concat([decipher.update(userdata.data) , decipher.final()])
          const cipher = crypto.createCipher('aes256', req.body.password)
          const encrypted = Buffer.concat([cipher.update(userdata.data) , cipher.final()])
          userdata.data = encrypted
          userdata.save()
        }).catch(e => {})
      } else
        req.user.getData().then(userdata => userdata && userdata.destroy()).catch(e => {})
      req.user.password = pwhash
      saveUpdated(user, res)
    })
  else
    saveUpdated(user, res)
}

function saveUpdated(user, res) {
  user.save().then(updatedUser => {
    res.status(200).send(helpers.extractPrivateInfo(updatedUser))
  })
  .catch(e => {
    res.status(500).send('An error occurred.')
  })
}

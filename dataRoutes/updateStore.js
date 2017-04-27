const Promise = require('bluebird')
const axios = require('axios')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const helpers = require('../db/modelHelpers')
const Store = require('../db/model').Store
const config = require('../config.json')

module.exports = (req, res) => {
  if (req.user.id != req.store.owner.id)
    res.status(403).send('user is not authorized to change the store settings')
  if (req.body.access != null && req.body.access >= 0 && req.body.access <= 2)
    req.store.access = req.body.access
  let newPW = req.body.password || req.headers['x-store-auth'].split(' ').pop()
  linkhash = crypto.createHash('sha256').update(buffer.toString('base64')).digest('hex')
  const linkPwHash = crypto.createHash('sha256').update(newPW+linkhash).digest('hex')
  const linkPwHashOld = crypto.createHash('sha256').update(req.headers['x-store-auth'].split(' ').pop()+linkhash).digest('hex')
  Promise.fromNode(cb => bcrypt.hash(linkPwHash, config.bcryptRounds, cb))
  .then(pwhash => {
    req.store.password = pwhash
    return req.store.save()
  })
  .then(updatedStore => {
    return Store.findById(updatedStore.id, {include: [{model: User, as: 'owner', attributes: ['id', 'name']}]})
  })
  .then(store => {
    res.status(201).send(helpers.extractStoreInfo(store))
    return store.getFiles()
  })
  .then(dbFiles => {
    const files = dbFiles.map(file => {
      return {
        id: file.id,
        oldKey: crypto.createHash('sha256').update(linkPwHashOld+dbFile.salt).digest('base64'),
        newKey: crypto.createHash('sha256').update(linkPwHash+dbFile.salt).digest('base64')
      }
    })
    axios({
      method: 'POST',
      url: process.env.UPLOAD_URL + '/internal/files/reencrypt',
      headers: {Authorization: 'i '+process.env.INTERNAL_AUTH_KEY},
      data: {files}
    })
    .catch(e => {
      //TODO
    })
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
  res.status(501).send()
}
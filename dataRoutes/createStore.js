const bcrypt = require('bcrypt')
const crypto = require('crypto')
const Promise = require('bluebird')

const AppError = require('../error')
const config = require('../config.json')
const Store = require('../db/model').Store
const Folder = require('../db/model').Folder
const User = require('../db/model').User
const helpers = require('../db/modelHelpers')

module.exports = (req, res) => {
  var pwhash = null
  var linkhash = null
  var storeId = null
  req.checkBody('name', 'No store name provided.').notEmpty()
  req.checkBody('password', 'No store password provided.').notEmpty().isLength({min: 8})
  req.checkBody('access', 'No access method provided').notEmpty().isInt()
  req.getValidationResult()
  .then(validation => {
    if (!validation.isEmpty())
      return Promise.reject(new AppError(400, validation))
    return Promise.fromNode(cb => crypto.randomBytes(256, cb))
  })
  .then(buffer => {
    linkhash = crypto.createHash('sha256').update(buffer.toString('base64')).digest('hex')
    const linkPwHash = crypto.createHash('sha256').update(req.body.password+linkhash).digest('hex')
    return Promise.fromNode(cb => bcrypt.hash(linkPwHash, config.bcryptRounds, cb))
  })
  .then(linkPwHashBcrypt => {
    return Store.create({
      name: req.body.name,
      password: linkPwHashBcrypt,
      access: req.body.access,
      linkHash: linkhash,
      size: 0,
      folders: [{name: '/', noDelete: true}]
    }, {include: [Folder]})
  })
  .then(store => {
    storeId = store.id
    return store.setOwner(req.user)
    .then(() => Promise.resolve(store))
  })
  .then(store => {
    return store.addMember(req.user)
  })
  .then(() => {
    return Store.findById(storeId, {include: [{model: User, as: 'owner', attributes: ['id', 'name']}]})
  })
  .then(store => {
    res.status(201).send(helpers.extractStoreInfo(store))
  })
  .catch(e => {
    console.log(e)
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}

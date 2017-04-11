const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Promise = require('bluebird')
const bcrypt = require('bcrypt')


const User = require('./model').User
const StoreUser = require('./model').StoreUser
const Store = require('./model').Store
const config = require('../config.json')
const AppError = require('../error')

module.exports = {
  getPublicInfo: userId => User.findById(userId, {attributes: ['id', 'name']}),
  getPrivateInfo: userId => User.findById(userId, {attributes: ['id', 'name', 'email']}),
  extractPublicInfo: user => Object.assign({}, {
    id: user.getDataValue('id'),
    name: user.getDataValue('name')
  }),
  extractPrivateInfo: user => Object.assign({}, {
    id: user.getDataValue('id'),
    name: user.getDataValue('name'),
    email: user.getDataValue('email')
  }),
  createJwt: (user) => {
    const pwhash = crypto.createHash('md5').update(user.getDataValue('password')).digest('hex')
    return jwt.sign(
                    {id: user.getDataValue('id'), pwhash: pwhash},
                    process.env.JWTSECRET,
                    {expiresIn: config.jwtExpiresIn})
  },
  decodeJwt: (token, cb) => {
    jwt.verify(token, process.env.JWTSECRET, (err, data) => {
      if (err) {
        cb(new AppError(401, 'jwt decode error'), null)
        return
      }
      User.findById(data.id).then(user => {
        if (!user) {
          cb(new AppError(401, 'User Not Found'))
          return
        }
        const pwhash = crypto.createHash('md5').update(user.getDataValue('password')).digest('hex')
        if (pwhash === data.pwhash)
          cb(null, user)
        else
          cb(new AppError(401, 'password was changed'), null)
      })
      .catch(e => {
        cb(new AppError(401, 'db error'), null)
      })
    })
  },
  extractStoreInfo: store => {
    const json = store.toJSON()
    delete json.password
    if (json.access < 2)
      delete json.linkHash
    return json
  },
  getStoreIfAllowed: (storeId, storeAccessHeader, user) => {
    const header = storeAccessHeader
    return Store.findById(storeId, {include: [{model: User, as: 'owner', attributes: ['id', 'name']}]})
    .then(store => {
      if (!store)
        return Promise.reject(new AppError(404, 'store not found'))
      if (header.substr(0,2) == 'p ') {
        if (store.access > 0) {
          const password = header.substr(2, header.length-2)
          const pwLinkHash = crypto.createHash('sha256').update(password+store.get('linkHash')).digest('hex')
          return Promise.fromNode(cb => bcrypt.compare(pwLinkHash, store.get('password'), cb))
          .then(result => {
            if (!result)
              return Promise.reject(new AppError(423, 'invalid password'))
            return Promise.resolve(store)
          })
        } else if (!user)
          return Promise.reject(new AppError(423, 'store not authenticated'))
        else {
          return store.hasMember(user)
          .then(hasUsr => {
            if (!hasUsr)
              return Promise.reject(new AppError(403, 'Not authorized to access store'))
            const password = header.substr(2, header.length-2)
            const pwLinkHash = crypto.createHash('sha256').update(password+store.get('linkHash')).digest('hex')
            return Promise.fromNode(cb => bcrypt.compare(pwLinkHash, store.get('password'), cb))
            .then(result => {
              if (!result)
                return Promise.reject(new AppError(423, 'invalid store password'))
              return Promise.resolve(store)
            })
          })
        }
      } else if (header.substr(0,2) == 'l ') {
        if (store.access > 1) {
          const pwLinkHash = header.substr(2, header.length-2)
          return Promise.fromNode(cb => bcrypt.compare(pwLinkHash, store.get('password'), cb))
          .then(result => {
            if (!result)
              return Promise.reject(new AppError(423, 'invalid link'))
            return Promise.resolve(store)
          })
        } else
          return Promise.reject(new AppError(423, 'link access not allowed'))
      } else
        return Promise.reject(new AppError(423, 'Invalid access header provided'))
    })
  }
}

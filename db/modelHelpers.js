const hash = require('crypto').createHash
const jwt = require('jsonwebtoken')

const User = require('./model').User
const StoreUser = require('./model').StoreUser
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
    const pwhash = hash('md5').update(user.getDataValue('password')).digest('hex')
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
        const pwhash = hash('md5').update(user.getDataValue('password')).digest('hex')
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
  addUserToStore: (store, userId) => {
    StoreUser.create({userId: ""})
  }
}

const Promise = require('bluebird')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const helpers = require('./db/modelHelpers')
const User = require('./db/model').User
const Store = require('./db/model').Store
const StoreUser = require('./db/model').StoreUser
const AppError = require('./error')

const slowdown = function (req, res, next) {
  setTimeout(next, 2000)
}

const allowCORS = function(req, res, next) {
  const origin = req.get('origin')
  if ((origin == 'http://localhost:8080' && process.env.NODE_ENV != 'production') || origin == 'https://cloudstudies.de') {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-store-auth,x-user-pw')
  }
  if (req.method == 'OPTIONS')
    res.status(200).end()
  else
    next()
}

const auth = (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(401).send('user not authenticated')
    return
  }
  helpers.decodeJwt(req.headers.authorization, (err, user) => {
    if (err)
      return res.status(401).send(err.message)
    req.user = user
    next()
  })
}

const authOptional = (req, res, next) => {
  if (!req.headers.authorization)
    next()
  else
    helpers.decodeJwt(req.headers.authorization, (err, user) => {
      if (!err)
      req.user = user
      next()
    })
}

const internalAuth = (req, res, next) => {
  if (!req.headers.authorization)
   return res.status(401).send('No authentication header.')
  if (req.headers.authorization !== 'i '+process.env.INTERNAL_AUTH_KEY)
    return res.status(401).send('Invalid authentication header.')
  next()
}

const store = (req, res, next) => {
  if (!req.params.storeId) return res.status(404).send('No store id provided')
  const header = req.headers['x-store-auth']
  if (!header) return res.status(401).send('No store access header provided')
  if (header.substr(0,2) == 'p ')
    Store.findById(req.params.storeId, {include: [{model: User, as: 'owner', attributes: ['id', 'name']}]})
    .then(store => {
      if (!store)
        return Promise.reject(new AppError(404, 'store not found'))
      if (store.access > 0) {
        const password = header.substr(2, header.length-2)
        const pwLinkHash = crypto.createHash('sha256').update(password+store.get('linkHash')).digest('hex')
        bcrypt.compare(pwLinkHash, store.get('password'), (err, result) => {
          if (err || !result)
            return res.status(401).send('invalid password')
          req.store = store
          next()
        })
      } else if (!req.user)
        return Promise.reject(new AppError(401, 'store not authenticated'))
      else {
        store.hasMember(req.user)
        .then(hasUsr => {
          if (!hasUsr)
            return Promise.reject(new AppError(403, 'Not authorized to access store'))
          const password = header.substr(2, header.length-2)
          const pwLinkHash = crypto.createHash('sha256').update(password+store.get('linkHash')).digest('hex')
          bcrypt.compare(pwLinkHash, store.get('password'), (err, result) => {
            if (err || !result)
              return res.status(401).send('invalid store password')
            req.store = store
            next()
          })
        })
        .catch(e => {
          if (e.httpstatus)
            return res.status(e.httpstatus).send(e.message)
          res.status(500).send(e.message)
        })
      }
    })
    .catch(e => {
      if (e.httpstatus)
        return res.status(e.httpstatus).send(e.message)
      res.status(500).send(e.message)
    })
  else if (header.substr(0,2) == 'l ')
    Store.findById(req.params.id)
    .then(store => {
      if (!store)
        return Promise.reject(new AppError(404, 'store not found'))
      if (store.access > 1) {
        const pwLinkHash = header.substr(2, header.length-2)
        bcrypt.compare(pwLinkHash, store.get('password'), (err, result) => {
          if (err || !result)
            return res.status(403).send('invalid link')
          req.store = store
          next()
        })
      } else
        return Promise.reject(new AppError(403, 'link access not allowed'))
    })
    .catch(e => {
      if (e.httpstatus)
        return res.status(e.httpstatus).send(e.message)
      res.status(500).send(e.message)
    })
  else
    res.status(401).send('Invalid access header provided')
}


module.exports = {slowdown, allowCORS, auth, authOptional, internalAuth, store}

const bcrypt = require('bcrypt')
const Promise = require('bluebird')
const util = require('util')

const config = require('../config.json')
const User = require('../db/model').User
const helpers = require('../db/modelHelpers')
const AppError = require('../error')


module.exports = (req, res) => {
  req.checkBody('username', 'No Username provided').notEmpty()
  req.checkBody('password', 'Password too short').notEmpty().isLength({min: 8})
  req.getValidationResult()
  .then(validation => {
    if (!validation.isEmpty())
      return res.status(400).send(validation.useFirstErrorOnly().mapped())
    let whereClause
    if (req.body.email)
      whereClause = {'$or': [{'name': req.body.username}, {'email': req.body.email}]}
    else
      whereClause = {name: req.body.username}
    User.findOne({where: whereClause})
    .then(foundUser => {
      if (foundUser)
        return Promise.reject(new AppError(403, 'User exists already'))
    })
    .then(() => {
      return Promise.fromCallback(cb => {
        bcrypt.hash(req.body.password, config.bcryptRounds, cb)
      })
    })
    .then(pwhash => User.create({name: req.body.username, email: req.body.email, password: pwhash}))
    .then(user => {
      const token = helpers.createJwt(user)
      res.status(201).send({
        user: helpers.extractPrivateInfo(user),
        token
      })
    })
    .catch(e => {
      if (e.httpstatus)
        res.status(e.httpstatus).send(e.message)
      else
        res.status(500).send(e.message)
    })
  })
}

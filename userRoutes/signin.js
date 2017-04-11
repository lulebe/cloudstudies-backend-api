const bcrypt = require('bcrypt')
const Promise = require('bluebird')

const config = require('../config.json')
const User = require('../db/model').User
const AppError = require('../error')
const helpers = require('../db/modelHelpers')

module.exports = (req, res) => {
  var user = null
  req.checkBody('username', 'No Username provided').notEmpty()
  req.checkBody('password', 'Password too short').notEmpty().isLength({min: 8})
  req.getValidationResult()
  .then(validation => {
    if (!validation.isEmpty())
      return Promise.reject(new AppError(400, validation.useFirstErrorOnly().mapped()))
    return User.findOne({where: {'$or': {'name': req.body.username, 'email': req.body.username}}})
  })
  .then(u => {
    if (!u)
      return Promise.reject(new AppError(404, 'User does not exist'))
    user = u
    return Promise.fromNode(cb => bcrypt.compare(req.body.password, user.getDataValue('password'), cb))
  })
  .then(pwres => {
    if (!pwres)
      return Promise.reject(new AppError(403, 'password is incorrect'))
    const token = helpers.createJwt(user)
    res.status(200).send({
      user: helpers.extractPrivateInfo(user),
      token
    })
  })
  .catch(e => {
    console.log(e)
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}

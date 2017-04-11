const Promise = require('bluebird')

const User = require('../db/model').User

module.exports = (req, res) => {
  if (!req.query.userId)
    return res.status(400).send('No userId provided')
  User.findById(req.query.userId)
  .then(user => {
    req.store.removeMember(user)
  })
  .then(() => {
    res.status(204).send()
  })
  .catch(e => {
    if (e.httpstatus)
      return res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}
const User = require('../db/model').User

module.exports = (req, res) => {
  if (!req.query.q) return res.status(400).send({msg: "No query specified."})
  User.findAll({where: {name: {$like: '%' + req.query.q + '%'}}, attributes: ['id', 'name'], limit: 10})
  .then(users => {
    res.status(200).send(users)
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}
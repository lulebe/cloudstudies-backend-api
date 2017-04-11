const Store = require('../db/model').Store
const helpers = require('../db/modelHelpers')

module.exports = (req, res) => {
  if (!req.query.q) return res.status(400).send({msg: "No query specified."})
  Store.findAll({where: {name: {$like: '%' + req.query.q + '%'}}, attributes: ['id', 'name'], limit: 10})
  .then(stores => {
    res.status(200).send(stores)
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}
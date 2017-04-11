const User = require('../db/model').User
const helpers = require('../db/modelHelpers')

module.exports = (req, res) => {
  req.user.getStores({include: [{model: User, as: 'owner', attributes: ['id', 'name']}]})
  .then(stores => {
    res.status(200).send(stores.map(store => helpers.extractStoreInfo(store)))
  })
}
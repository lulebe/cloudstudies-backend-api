const helpers = require('../db/modelHelpers')

module.exports = (req, res) => {
  req.user.getOwnedStores()
  .then(stores => {
    res.status(200).send(stores.map(store => helpers.extractStoreInfo(store)))
  })
}
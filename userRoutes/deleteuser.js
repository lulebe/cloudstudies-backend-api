const AppError = require('../error')
const helpers = require('../db/modelHelpers')

module.exports = (req, res) => {
  req.user.destroy()
  res.status(204).send()
}

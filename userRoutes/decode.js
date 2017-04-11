const helpers = require('../db/modelHelpers')

module.exports = (req, res) => {
  req.checkBody('token', 'No Token provided').notEmpty()
  req.getValidationResult()
  .then(validation => {
    if (!validation.isEmpty())
      return res.status(400).send(validation.useFirstErrorOnly().mapped())
    helpers.decodeJwt(req.body.token, (err, user) => {
      if (err)
        return res.status(err.httpstatus).send(err.message)
      res.status(200).send(helpers.extractPrivateInfo(user))
    })
  })
}

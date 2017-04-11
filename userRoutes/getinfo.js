const helpers = require('../db/modelHelpers')

module.exports = (req, res) => {
    if (req.user.id == req.params.id)
      helpers.getPrivateInfo(req.params.id)
      .then(user => {
        if (!user)
          res.status(404).send('User not found')
        else
          res.status(200).send(helpers.extractPrivateInfo(user))
      })
      .catch(err => {
        res.status(err.httpstatus).send(err.message)
      })
    else
      sendPublicInfo(req.params.id, res)
}

function sendPublicInfo(id, res) {
  helpers.getPublicInfo(id)
  .then(user => {
    if (!user)
      res.status(404).send('User not found')
    else
      res.status(200).send(JSON.stringify(user))
  })
  .catch(err => {
    if (err.httpstatus)
      res.status(err.httpstatus).send(err.message)
    else
      res.status(500).send(err.message)
  })
}

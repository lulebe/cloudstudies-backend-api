const png = require('project-name-generator')

const User = require('../db/model').User

module.exports = (req, res) => {
  generate(name => {
    res.status(200).send(name)
  })
}

function generate(cb) {
  const name = png({words: 2, number: true}).dashed
  User.findOne({where: {'username': name}})
  .then(user => {
    if (!user)
      cb(name)
    else
      generate(cb)
  })
  .catch(e => {
    cb(name)
  })
}

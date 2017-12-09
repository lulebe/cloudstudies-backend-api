const Mailgun = require('mailgun').Mailgun
const randomstring = require('randomstring')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const config = require('../config.json')
const User = require('../db/model').User
const AppError = require('../error')

const mg = new Mailgun(process.env.MAILGUNKEY)

module.exports = (req, res) => {
  req.checkBody('email', 'No E-Mail provided').notEmpty().isEmail()
  req.getValidationResult()
  .then(validation => {
    if (!validation.isEmpty())
      return Promise.reject(new AppError(400, validation.useFirstErrorOnly().mapped()))
    return User.findOne({where: {email: req.body.email}})
  })
  .then(user => {
    if (!user)
      return new AppError(404, 'Email was not found')
    const email = user.getDataValue('email')
    if (!email)
      return new AppError(404, 'Email was not found')
    const newpw = randomstring.generate(12)
    let newpwhash = crypto.createHash('sha256').update(newpw).digest('base64')
    newpwhash = newpwhash.replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '')
    bcrypt.hash(newpwhash, config.bcryptRounds, (err, pwhash) => {
      if (err)
        return new AppError(500, 'Password could not be hashed.')
      //set new password
      user.update({password:pwhash})
      //delete userdata
      user.getData().then(userdata => userdata.destroy()).catch(e => {})
      mg.sendText(
        'Cloud Studies <noreply@mail.cloudstudies.de>',
        email,
        'Cloud Studies Password reset',
        'Your Cloud Studies Password has been reset to:\n'+newpw,
        err => {
          if (err)
            res.status(500).send('Could not send email.')
          else
            res.status(200).send()
        }
      )
    })
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}

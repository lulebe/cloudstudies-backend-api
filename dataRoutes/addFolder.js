const Promise = require('bluebird')

const AppError = require('../error')
const Folder = require('../db/model').Folder

module.exports = (req, res) => {
  req.checkBody('shortname', 'invalid name').notEmpty().matches(/^[a-z0-9 ]+$/i)
  req.checkBody('parentId', 'no parent specified').notEmpty().isInt()
  req.getValidationResult()
  .then(validation => {
    if (!validation.isEmpty())
      return Promise.reject(new AppError(400, validation.useFirstErrorOnly().mapped()))
    return Folder.findOne({where: {id:req.body.parentId, storeId: req.store.id}})
  })
  .then(parentFolder => {
    if (!parentFolder)
      return Promise.reject(new AppError(404, 'parent folder not found'))
    const folderName = (parentFolder.name + '/' + req.body.shortname).replace('//', '/')
    return Folder.create({
      name: folderName,
      parentId: parentFolder.id,
      storeId: req.store.id,
      noDelete: false
    })
  })
  .then(folder => {
    res.status(200).send(folder.toJSON())
  })
  .catch(e => {
    if (e.httpstatus)
      return res.status(e.httpstatus).send(e.message)
    res.status(500).send(e.message)
  })
}
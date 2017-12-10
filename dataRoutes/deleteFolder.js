const Promise = require('bluebird')
const axios = require('axios')

const AppError = require('../error')
const Folder = require('../db/model').Folder
const File = require('../db/model').File

module.exports = (req, res) => {
  const header = req.headers['x-store-auth']
  if (!header) return res.status(401).send('No store access header provided')
  let folder = null
  Folder.findById(req.params.folderId)
  .then(f => {
    if (!f)
      return new AppError(404, 'folder not found')
    folder = f
    return helpers.getStoreIfAllowed(folder.storeId, header, req.user)
  })
  .then(() => {
    return findAllFilesAndFolders(folder.name, folder.storeId)
  })
  .then(filesList => {
    axios({
      method: 'POST',
      url: process.env.UPLOAD_URL+'/internal/files/delete',
      headers: {Authorization: 'i '+process.env.INTERNAL_AUTH_KEY},
      data: {
        files: filesList
      }
    })
  })
  .catch(e => {
    if (e.httpstatus)
      res.status(e.httpstatus).send(e.message)
    else
      res.status(500).send(e.message)
  })
}

function findAllFilesAndFolders (baseFolderName, storeId) {
  return Folder.findAll({where: {storeId: storeId, name: {$like: baseFolderName + '%'}}}, {include: [{model: File}]})
  .then(folders => {
    const filesList = []
    folders.forEach(folder => {
      folder.files.forEach(file => {
        filesList.push(file.id)
      })
      folder.destroy()
      .catch(e => {})
    })
    return Promise.resolve(filesList)
  })
}

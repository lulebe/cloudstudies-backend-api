const bcrypt = require('bcrypt')
const Promise = require('bluebird')

const config = require('../config.json')
const Store = require('../db/model').Store
const File = require('../db/model').File
const helpers = require('../db/modelHelpers')

module.exports = (req, res) => {
  req.store.getFolders({include: [{model: File}]})
  .then(folders => {
    const jsonStore = helpers.extractStoreInfo(req.store)
    jsonStore.folders = folders.map(f => f.toJSON())
    if (req.user && req.user.id === req.store.ownerId)
      return req.store.getMembers().then(members => {
        jsonStore.members = members.map(m => m.toJSON()).map(m => ({id: m.id, name: m.name}))
        return Promise.resolve(jsonStore)
      })
    else
      return Promise.resolve(jsonStore)
  })
  .then(jsonStore => {
    res.status(200).send(jsonStore)
  })
  .catch(e => {
    res.status(500).send(e.message)
  })
}
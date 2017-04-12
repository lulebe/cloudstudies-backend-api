const Sequelize = require('sequelize')

const db = require('./db')

const User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  password: {
    type: Sequelize.STRING(60),
    allowNull: false
  }
})

const Userdata = db.define('userdata', {
  data: {
    type: Sequelize.BLOB,
    allowNull: true
  },
  salt: {
    type: Sequelize.STRING,
    allowNull: false
  }
})
Userdata.removeAttribute('id')

const Store = db.define('store', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING(60),
    allowNull: false
  },
  access: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  linkHash: {
    type: Sequelize.STRING,
    allowNull: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  size: {
    type: Sequelize.INTEGER,
    allowNull: false,
    default: 0
  }
})

const Folder = db.define('folder', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  noDelete: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  }
}, {
  indexes: [
    {
      name: 'name',
      fields: ['storeId', 'name'],
      unique: true
    }
  ]
})

const File = db.define('file', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  salt: {
    type: Sequelize.STRING,
    allowNull: false
  },
  size: {
    type: Sequelize.INTEGER,
    default: 0
  }
})

const Test = db.define('test', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  collaborative: Sequelize.BOOLEAN,
  owner: Sequelize.INTEGER
})

const TestQuestion = db.define('testquestion', {
  question: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  answer: {
    type: Sequelize.TEXT,
    allowNull: true
  }
})


Userdata.belongsTo(User)
User.hasOne(Userdata, {as: 'Data'})

User.hasMany(Store, {as: 'ownedStores', foreignKey: 'ownerId'})
Store.belongsTo(User, {as: 'owner', foreignKey: 'ownerId'})

Store.belongsToMany(User, {as: 'members', through: 'StoreUsers', foreignKey: 'storeId'})
User.belongsToMany(Store, {as: 'stores', through: 'StoreUsers', foreignKey: 'userId'})

Store.hasMany(Folder)
Folder.belongsTo(Store)

Folder.hasMany(Folder, {foreignKey: 'parentId'})
Folder.belongsTo(Folder, {as: 'parent', foreignKey: 'parentId'})

Folder.hasMany(File)
File.belongsTo(Folder)

Folder.hasMany(Test)
Test.belongsTo(Folder)

Test.hasMany(TestQuestion)
TestQuestion.belongsTo(Test)

module.exports = {User, Userdata, Store, Folder, File, Test, TestQuestion}

const express = require('express')

const mw = require('./middleware')
const userRouter = require('./userRoutes')
const userdataRouter = require('./userdataRoutes')
const dataRouter = require('./dataRoutes')

const app = express()

//app.use(mw.slowdown)
app.use(mw.allowCORS)

app.use('/users', userRouter)
app.use('/data', dataRouter)
app.use('/userdata', userdataRouter)

app.listen(process.env.PORT, () => {
  console.log('Listening on ' + process.env.PORT)
})

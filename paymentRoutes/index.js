const bodyParser = require('body-parser')

const router = require('express').Router()



router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: false}))

router.get('/new', logger)
router.post('/new', logger)

module.exports = router

function logger (req, res) {
  console.log('NEW PAYMENT')
  console.log(req.query)
  console.log(req.body)
  console.log(req.params)
  console.log(req.method)
  console.log('-----------')
  res.status(200).send()
}
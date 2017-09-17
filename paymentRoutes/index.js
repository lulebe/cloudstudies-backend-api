const bodyParser = require('body-parser')

const router = require('express').Router()



router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: false}))

router.post('/new', (req, res) => {
  const durationRaw = req.body.option_selection1
  const storeId = req.body.option_selection2
  let durationMonths = 1
  if (durationRaw == '3 Months')
    durationMonths = 3
  else if (durationRaw == '6 Months')
    durationMonths = 6
  //TODO handle payment
})

module.exports = router
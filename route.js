const express = require('express')
const router = express.Router();

const {get_agencies_by_location} = require('./Controller/filter')
const {get_search} = require('./Controller/search')
const {create_agencies , upload} = require('./Controller/agencies')

router.post('/create' , upload.single('logo'), create_agencies)
router.get('/search' , get_search)
router.get('/search/location' ,  get_agencies_by_location)

module.exports = router 
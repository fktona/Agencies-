const express = require('express')
const router = express.Router();

const {get_agencies_by_location} = require('./Controller/filter')
const {get_search} = require('./Controller/search')
const {create_agencies , upload ,get_agency, getAgencyById ,approveAgency,getApprovedAgencies} = require('./Controller/agencies')

router.post('/create' , upload.single('logo'), create_agencies)
router.get('/agency/:id', getAgencyById)
router.get('/agency/approve', getApprovedAgencies)
router.patch('/agency/approve/:agencyId', approveAgency)
router.get('/search' , get_search)
router.get('/agency' ,  get_agency)
router.get('/search/location' ,  get_agencies_by_location )

module.exports = router 

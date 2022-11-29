const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");
const scootersModel = require("../models/scooters.js");

// Skriv i auth en checker som kollar om validerad när man anger en x-access-token eller oauth2 ( SOM API saken )

router.get('/overview',
    (req, res) => scootersModel.getAllScootersOverview(res, req.path));

router.get('/',
    (req, res) => scootersModel.getAllScooters(res, req.path));

router.post('/',
    (req, res) => scootersModel.registerScooter(res, req.body, req.path));
    
router.delete('/',
    (req, res) => scootersModel.deleteScooter(res, req.body.scooter_id, req.path));

router.put('/',
    (req, res) => scootersModel.editScooter(res, req.body, req.path));

router.get('/:scooter_id',
    (req, res) => scootersModel.getSpecificScooter(res, req.params.scooter_id, req.path));

router.get('/owner/:owner_id',
    (req, res) => scootersModel.getAllScootersCity(res, req.params.owner_id, req.path));

router.put('/status',
    (req, res) => scootersModel.editStatusScooter(res, req.body, req.path));
    
router.put('/position',
    (req, res) => scootersModel.editPositionScooter(res, req.body, req.path));

router.post('/rent',
    (req, res) => scootersModel.rentScooter(res, req.body.scooter_id, req.path));

router.post('/stop',
    (req, res) => scootersModel.stopScooter(res, req.body, req.path));

module.exports = router;
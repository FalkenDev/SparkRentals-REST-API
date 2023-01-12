const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");
const scootersModel = require("../models/scooters.js");

router.get('/overview', // Get scooter overview
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => scootersModel.getAllScootersOverview(res, req.path));

router.get('/', // Get all scooters information
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => scootersModel.getAllScooters(res, req.path));

router.post('/', // Register a scooter ( Only Admin access )
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => scootersModel.registerScooter(res, req.body, req.path));
    
router.delete('/', // Delete a scooter ( Only Admin access )
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => scootersModel.deleteScooter(res, req.body.scooter_id, req.path));

router.put('/', // Edit a scooter ( Only Admin access )
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => scootersModel.editScooter(res, req.body, req.path));

router.get('/:scooter_id', // Get specific scooter
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => scootersModel.getSpecificScooter(res, req.params.scooter_id, req.path));

router.get('/owner/:owner_id', // Get all scooters from a city
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => scootersModel.getAllScootersCity(res, req.params.owner_id, req.path));

router.put('/status', // Get status form a specific scooter
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => scootersModel.editStatusScooter(res, req.body, req.path));
    
router.put('/coordinates', // Get coordinates from a specific scooter
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => scootersModel.editCoordinatesScooter(res, req.body, req.path));

router.post('/rent', // Rent a scooter
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => scootersModel.rentScooter(res, req.body.scooter_id, req.body.user_id, req.path));

router.post('/stop', // Stop rent a scooter
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => scootersModel.stopScooter(res, req.body.scooter_id, req.body.user_id, req.path));

module.exports = router;
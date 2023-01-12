const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");
const citiesModel = require("../models/cities.js");

// Skriv i auth en checker som kollar om validerad när man anger en x-access-token eller oauth2 ( SOM API saken )

router.get('/overview',
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => citiesModel.getAllCitiesOverview(res, req.path));

router.get('/',
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => citiesModel.getAllCitiesInformation(res, req.path));

router.post('/',
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => citiesModel.registerCity(res, req.body, req.path));
    
router.delete('/',
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => citiesModel.deleteCity(res, req.body.city_id, req.path));

router.put('/',
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => citiesModel.editCity(res, req.body, req.path));

router.get('/:city_id',
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => citiesModel.getSpecificCity(res, req.params.city_id, req.path));

router.put('/tax',
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => citiesModel.editTaxRateFromCity(res, req.body, req.path));

router.post('/zones',
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => citiesModel.registerZone(res, req.body, req.path));

router.delete('/zones',
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => citiesModel.deleteZone(res, req.body, req.path));

router.put('/zones',
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => citiesModel.editZone(res, req.body, req.path));

module.exports = router;
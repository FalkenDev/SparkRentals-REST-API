const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");
const prepaidModel = require("../models/prepaid.js");

router.get('/', // Get all prepaid cards information
    (req, res, next) => authModel.checkValidAdmin(req, res, next), // Only admin
    (req, res) => prepaidModel.getAllPrepaids(res));
    

router.post('/', // Register a prepaid card
    (req, res, next) => authModel.checkValidAdmin(req, res, next), // Only admin
    (req, res) => prepaidModel.registerPrepaid(res, req.body));

router.delete('/', // Delete a prepaid card
    (req, res, next) => authModel.checkValidAdmin(req, res, next), // Only admin
    (req, res) => prepaidModel.deletePrepaid(res, req.body.prepaid_id));

router.put('/', // Edit a prepaid card
    (req, res, next) => authModel.checkValidAdmin(req, res, next), // Only admin
    (req, res) => prepaidModel.editPrepaid(res, req.body));

router.get('/:prepaid_id', // Get specific prepaid card
    (req, res, next) => authModel.checkValidAdmin(req, res, next), // Only admin
    (req, res) => prepaidModel.getSpecificUser(res, req.params.prepaid_id));

module.exports = router;
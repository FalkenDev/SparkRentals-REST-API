const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");
const adminsModel = require("../models/admins.js");

router.post('/', // Register a admin (JWT)
    (req, res, next) => authModel.checkValidAdmin(req, res, next), // Only admins can do this
    (req, res) => authModel.adminRegister(res, req.body, req.path));

router.delete('/', // Delete a admin account (JWT)
    (req, res, next) => authModel.checkValidAdmin(req, res, next), // Only admins can do this
    (req, res) => adminsModel.deleteAdmin(res, req.body.admin_id, req.path));

router.put('/', // Edit a admin account (JWT)
    (req, res, next) => authModel.checkValidAdmin(req, res, next), // Only admins can do this
    (req, res) => adminsModel.editAdmin(res, req.body, req.path));

router.get('/', // Get all admins (JWT)
    (req, res, next) => authModel.checkValidAdmin(req, res, next), // Only admins can do this
    (req, res) => adminsModel.getAdmins(res, req.path));

router.get('/:admin_id', // Get specific admin (JWT)
    (req, res, next) => authModel.checkValidAdmin(req, res, next), // Only admins can do this
    (req, res) => adminsModel.getSpecificAdmin(res, req.body.admin_id, req.path));

module.exports = router;
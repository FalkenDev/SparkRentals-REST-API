const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");
const adminsModel = require("../models/admins.js");

router.post('/', // Register a admin (JWT)
    (req, res, next) => authModel.adminCheckToken(req, res, next),
    (req, res) => authModel.adminRegister(res, req.body));

router.delete('/', // Delete a admin account (JWT)
    (req, res, next) => authModel.adminCheckToken(req, res, next),
    (req, res) => adminsModel.deleteAdmin(res, req.body));

router.put('/', // Edit a admin account (JWT)
    (req, res, next) => authModel.adminCheckToken(req, res, next),
    (req, res) => adminsModel.editAdmin(res, req.body));

router.get('/', // Get all admins (JWT)
    (req, res, next) => authModel.adminCheckToken(req, res, next),
    (req, res) => adminsModel.getAdmins(res));

router.get('/:admin_id', // Get specific admin (JWT)
    (req, res, next) => authModel.adminCheckToken(req, res, next),
    (req, res) => adminsModel.getSpecificAdmin(res, req.params.admin_id));

router.post('/login', // Admin login
    (req, res) => authModel.adminLogin(res, req.body));

module.exports = router;
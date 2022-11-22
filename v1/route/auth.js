const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");

router.post('/admin/login',
    (req, res) => authModel.adminLogin(res, req.body));

router.post('/admin',
    (req, res, next) => authModel.adminCheckToken(req, res, next),
    (req, res) => authModel.adminRegister(res, req.body));

module.exports = router;
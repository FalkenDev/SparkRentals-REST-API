const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");

router.post('/admin/login',
    (req, res) => authModel.adminLogin(res, req.body));

module.exports = router;
const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");

router.get("/api_key",
    (req, res) => authModel.getInvoices(res, req.query.api_key));
router.post('/login',
    (req, res) => authModel.adminLogin(res, req.body));

module.exports = router;
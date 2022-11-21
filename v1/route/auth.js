const express = require('express');
const router = express.Router();

const authModel = require("../models/auth.js");


router.get("/api_key",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => authModel.getInvoices(res, req.query.api_key));
router.post('/login', (req, res) => authModel.login(res, req.body));
router.post('/register', (req, res) => authModel.register(res, req.body));
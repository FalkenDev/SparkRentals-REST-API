const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");
const usersModel = require("../models/users.js");

router.get('/overview', // Get all users overview
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => res.send(501));

router.get('/', // Get all users information
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => usersModel.getAllUsers(res, req.body));

router.post('/', // Register a user
    (req, res) => authModel.userRegister(res, req.body));

router.delete('/', // Delete a user
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.deleteUser(res, req.body.user_id));

router.put('/', // Edit a user
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.editUser(res, req.body));

router.get('/:user_id', // Get specific user
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => usersModel.getSpecificUser(res, req.params.user_id));

router.get('/history', // Get all ride history from a user
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.getUserHistory(res, req.params.user_id));

router.get('/history/details', // Get specific ride history from a user
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.getUserDetails(res, req.params.user_id, req.params.history_id));

router.post('/addfund', // Add balance to the user with the prepaid code
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.addUserFunds(res, req.body));

module.exports = router;
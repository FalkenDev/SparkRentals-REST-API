const express = require('express');
const router = express.Router();
const authModel = require("../models/auth.js");
const usersModel = require("../models/users.js");
const passport = require('passport');

router.get('/overview', // Get all users overview ( Only Admin access )
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => res.send(501));

router.get('/', // Get all users information ( Only Admin access )
    (req, res, next) => authModel.checkValidAdmin(req, res, next),
    (req, res) => usersModel.getAllUsers(res, req.path));

router.post('/', // Register a user
    (req, res) => authModel.userRegister(res, req.body, req.path));

router.delete('/', // Delete a user
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.deleteUser(res, req.body.user_id, req.path));

router.delete('/google/', // Delete a user ( For google authentication, using google AccessToken )
    passport.authenticate('google-oauth-token'),
    (req, res) => usersModel.deleteUser(res, req.body.user_id, req.path));

router.put('/', // Edit a user
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.editUser(res, req.body, req.path));

router.put('/google/', // Edit a user ( For google authentication, using google AccessToken )
    passport.authenticate('google-oauth-token'),
    (req, res) => usersModel.editUser(res, req.body, req.path));

router.get('/:user_id', // Get specific user
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.getSpecificUser(res, req.params.user_id, req.path));

router.get('/google/:user_id', // Get specific user ( For google authentication, using google AccessToken )
    passport.authenticate('google-oauth-token'),
    (req, res) => usersModel.getSpecificUser(res, req.params.user_id, req.path));

router.get('/history', // Get all ride history from a user
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.getUserHistory(res, req.params.user_id, req.path));

router.get('/history/details', // Get specific ride history from a user
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.getUserDetails(res, req.params.user_id, req.params.history_id, req.path));

router.post('/addfund', // Add balance to the user with the prepaid code
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => usersModel.addUserFunds(res, req.body, req.path));

router.post('/google/addfund', // Add balance to the user with the prepaid code ( For google authentication, using google AccessToken )
    passport.authenticate('google-oauth-token'),
    (req, res) => usersModel.addUserFunds(res, req.body, req.path));

module.exports = router;
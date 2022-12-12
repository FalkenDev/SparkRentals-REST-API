const express = require('express');
const passport = require('passport');
const router = express.Router();
const authModel = require("../models/auth.js");

const successLoginUrl = "http://sparkrentals.software:8393/v1";
const errorLoginUrl = "http://sparkrentals.software:8393/v1/auth/login/google/error";

router.get("/login/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/google/callback", passport.authenticate("google", {
        failureMessage: "Cannot login to Google, please try again later!",
        failureRedirect: errorLoginUrl,
        successRedirect: successLoginUrl,
        //successRedirect: successLoginUrl,*/
    })
);

router.get("/logout/google",
(req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/v1');
      });
});

router.get("/login/google/error",
(req, res, next) => {
    res.send(401);
});


module.exports = router;
const express = require('express');
const passport = require('passport');
const router = express.Router();
const authModel = require("../models/auth.js");

router.get("/login/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/google/callback", passport.authenticate("google", {
        failureMessage: "Cannot login to Google, please try again later!",
        failureRedirect: process.env.GOOGLE_SUCCESS_URL,
        successRedirect: process.env.GOOGLE_FAILURE_URL,
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
(req, res) => {
    res.status(401).json({
        errors: {
            status: 401,
            title: "Login error",
            detail: "ERROR"
        }
    });
});


module.exports = router;
const express = require('express');
const passport = require('passport');
const router = express.Router();
const authModel = require("../models/auth.js");

router.get("/login/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/google/callback", passport.authenticate("google", {
        failureMessage: "Cannot login to Google, please try again later!",
        failureRedirect: process.env.GOOGLE_FAILURE_URL,
        successRedirect: process.env.GOOGLE_SUCCESS_URL,
    })
);

router.post("/login/server/admin",
    (req, res) => authModel.adminLogin(res, req.body, req.path)
);

router.post("/login/server/user",
    (req, res) => authModel.userLogin(res, req.body, req.path)
);

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

router.get("/login/google/success",
(req, res, next) => authModel.validTokenKey(req, res, next),
(req, res) => {
    res.status(201).json({
        data: {
            message: "User successfully login."
        }
    });
});

router.get("/logout/google",
(req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.status(201).json({
            data: {
                message: "User successfully logout."
            }
        });
      });
});

router.get("/google/user",
    (req, res, next) => authModel.validTokenKey(req, res, next),
    (req, res) => res.json(req.user)
);

router.get("/google/user/token",
    passport.authenticate('google-oauth-token'),
    (req, res) => res.json(req.user)
);


module.exports = router;
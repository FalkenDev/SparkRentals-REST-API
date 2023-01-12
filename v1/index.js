const express = require('express');
const path = require("path");
const router = express.Router();
const authModel = require("./models/auth.js");
const routeAuth = require("./route/auth.js");
const routeAdmins = require("./route/admins.js");
const routeScooters = require("./route/scooters.js");
const routeCities = require("./route/cities.js");
const routeUsers = require("./route/users.js");
const routePrepaids = require("./route/prepaid.js");

router.all('*', authModel.checkAPIKey);

router.get('/',
    (req, res) => res.sendFile(path.join(__dirname + '/documentation/documentation.html')));

router.use("/auth", routeAuth);
router.use("/admins", routeAdmins);
router.use("/scooters", routeScooters);
router.use("/cities", routeCities);
router.use("/users", routeUsers);
router.use("/prepaids", routePrepaids);

router.use(function (req, res) {
    return res.status(404).json({
        errors: {
            status: 404,
            source: req.path,
            title: "Not found",
            detail: "Could not find path: " + req.path,
        }
    });
});

module.exports = router;

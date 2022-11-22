const express = require('express');
const path = require("path");
const router = express.Router();
const authModel = require("./models/auth.js");
const auth = require("./route/auth.js");

// MongoDb Database
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";

//router.all('*', authModel.checkAPIKey);

router.get('/', (req, res) => res.sendFile(path.join(__dirname + '/documentation.html')));

router.use("/auth", auth);

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

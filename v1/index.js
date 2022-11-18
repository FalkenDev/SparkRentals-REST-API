const express = require('express');
const path = require("path");
const router = express.Router();


router.get('/', function(req, res){
    console.log("Worker: " + process.pid)
    res.sendFile(path.join(__dirname + '/documentation.html'));
})


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

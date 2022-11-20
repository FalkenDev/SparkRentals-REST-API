const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
var cluster = require("cluster"); // Load Balancer

// Passport for User Auth
var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;

// Using version 1
const v1 = require("./v1/index.js");

// Server port
const port = process.env.PORT || 8393;


// Configure the Bearer strategy for use by Passport.
//
// The Bearer strategy requires a `verify` function which receives the
// credentials (`token`) contained in the request.  The function must invoke
// `cb` with a user object, which will be set at `req.user` in route handlers
// after authentication.
passport.use(new Strategy(
    function(token, cb) {
      db.users.findByToken(token, function(err, user) { // Sätt in mongodb databasen där
        if (err) { return cb(err); }
        if (!user) { return cb(null, false); }
        return cb(null, user);
      });
    }));


const app = express();

app.disable('x-powered-by');

app.set("view engine", "ejs");

app.use(cors());
app.use(require('morgan')('combined'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public")));
app.use("/v1", v1); // Using the first version


if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    var cpuCount = require('os').cpus().length;
    console.log(`Total CPU ${cpuCount}`);

    // Create a worker for each CPU
    for (var worker = 0; worker < cpuCount; worker += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function () {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
    })
} else {
    app.listen(port, () => console.log(`Worker ID ${process.pid}, is running on http://localhost:` + port));
}
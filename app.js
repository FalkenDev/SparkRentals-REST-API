const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
var cluster = require("cluster"); // Load Balancer
var filter = require('content-filter') // reliable security for MongoDB applications against the injection attacks
require('dotenv').config();

// Using version 1
const v1 = require("./v1/index.js");

// Server port
const port = process.env.PORT || 8393;

const RateLimit = require('express-rate-limit');
const apiLimiter = RateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 1000, // Limit each IP to 1000 requests per `window` (here, per 1 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app = express();

// apply rate limiter to all requests
app.use(apiLimiter);

app.disable('x-powered-by');

app.set("view engine", "ejs");

app.use(cors());
app.options('*', cors());

app.use(require('morgan')('combined'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, "public")));

app.use(filter());

app.use("/v1", v1); // Using the first version

// Cluster
/*if (cluster.isPrimary) {
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
} else {*/
    app.listen(port, () => console.log(`Worker ID ${process.pid}, is running on http://localhost:` + port));
//}
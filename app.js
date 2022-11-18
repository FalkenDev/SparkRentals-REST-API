const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
var cluster = require("cluster");
const v1 = require("./v1/index.js");

const app = express();

app.use(cors());
//app.options('*', cors());

app.disable('x-powered-by');

app.set("view engine", "ejs");

const port = process.env.PORT || 8081;

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, "public")));

app.use("/", v1);

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
        cluster.fork;
    })
} else {
    app.listen(port, () => console.log(`Worker ID ${process.pid}, is running on http://localhost:` + port));
}
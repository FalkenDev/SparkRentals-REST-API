// Generating data to database for testing
var hat = require('hat');
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";

const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';

const scooters = require("./collections/scooter.js")
const cities = require("./collections/cities.js");
const users = require("./collections/user.js");
const admins = require("./collections/admins.js");
const prepaids = require("./collections/prepaid.js");



async function generate() {
    await scooters.generateScooters();
    await cities.generateCities();
    await users.generateUsers();
    await prepaids.generatePrepaids();
    await admins.generateAdmins();
}

generate();
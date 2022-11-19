const express = require('express');
const hat = require("hat"); // for creating api key
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";
let api_collection = db.collection("api");
let user_collection = db.collection("users");
let admin_collection = db.collection("admin");

try {
    const config = "../../conifg/config.json";
} catch(error) {
    console.log(error);
}

const jwtSecret = process.env.JWT_SECRET || config.secret;

const auth = {
    checkAPIKey: async function() {  // Check if the API Key works
        let client = new MongoClient(mongoURI);
        try {

        } catch (error) {
            console.log(error);
        } finally {
            await client.close();
        }
    },

    checkIsValidAPIKey: function() { // Check if the API key is valid

    },

    getAPIKey: function() { // Get current registerd api key if enterd correct password (Only admins knows) (Maybe just use curl for this)

    },

    createAPIKey: function() { // Create new API Key

    },

    removeAPIKey: function() { // Remove API Key

    },

    adminLogin: function() { // Admin login

    },

    adminRegister: function() { // Register a new Admin

    },

    adminCheckToken: function() { // Check the x-access-token from admin (Not need for user bcs it uses passport)

    }
}

module.exports(auth);
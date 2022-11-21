const express = require('express');
const hat = require("hat"); // for creating api key
const router = express.Router();
require('dotenv').config();
/*const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";
let api_collection = db.collection("api");
let user_collection = db.collection("users");
let admin_collection = db.collection("admin");*/

try {
    const config = "../../conifg/config.json";
} catch(error) {
    console.log(error);
}

const api_token = process.env.API_TOKEN


const auth = {
    checkAPIKey: async function(apiKey, path, res) {  // Check if it's correct API KEY (DONE)
        try {
            if (!api_token.includes(apiKey) ) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: path,
                        title: "Valid API key",
                        detail: "No valid API key provided."
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    adminLogin: function() { // Admin login

    },

    adminRegister: function() { // Register a new Admin

    },

    adminCheckToken: function() { // Check the x-access-token from admin (Not need for user bcs it uses passport)

    }
}

module.exports = auth;
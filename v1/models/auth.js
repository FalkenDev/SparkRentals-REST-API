const express = require('express');
const hat = require("hat"); // for creating api key
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";
/*let api_collection = db.collection("api");
let user_collection = db.collection("users");
let admin_collection = db.collection("admin");*/

try {
    const config = "../../conifg/config.json";
} catch(error) {
    console.log(error);
}

const api_token = process.env.API_TOKEN

const jwtSecret = process.env.JWT_SECRET;


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

    adminLogin: async function(res, body) { // Admin login
        const adminEmail = body.email;
        const adminPassword = body.password;
        const apiKey = body.apiKey;

        if (!adminEmail || !adminPassword) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        let client = new MongoClient(mongoURI);
        let db = client.db("spark-rentals");
        let admins_collection = db.collection("admins");
        let admin = await admins_collection.findOne({email: adminEmail});

        if (admin === null) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/admin/login",
                    title: "User not found",
                    detail: "User with provided email not found."
                }
            });
        }

        bcrypt.compare(adminPassword, admin.password, (err, result) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/admin/login",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }

            if (result) {
                let payload = { api_key: apiKey, email: admin.email };
                let jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

                return res.json({
                    data: {
                        type: "success",
                        message: "User logged in",
                        user: payload,
                        token: jwtToken
                    }
                });
            }

            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Wrong password",
                    detail: "Password is incorrect."
                }
            });
        });
    },

    adminRegister: function() { // Register a new Admin

    },

    adminCheckToken: function() { // Check the x-access-token from admin (Not need for user bcs it uses passport)

    }
}

module.exports = auth;
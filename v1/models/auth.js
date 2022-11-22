const express = require('express');
const hat = require("hat"); // for creating api key
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sanitize = require('mongo-sanitize'); // To prevent malicious users overwriting (NoSQL Injection)
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
        const adminEmail = sanitize(body.email);
        const adminPassword = sanitize(body.password);
        const apiKey = sanitize(body.apiKey);

        // If adminEmail or adminPassword is undefined
        if (!adminEmail || !adminPassword) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/auth/admin/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        // Find the email in database
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let admins_collection = db.collection("admins");
            let admin = await admins_collection.findOne({email: adminEmail});

            // If email not found in database
            if (admin === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "/auth/admin/login",
                        title: "Admin not found",
                        detail: "Admin with provided email not found."
                    }
                });
            }

            // Compare bcrypt password in database with password sent in.
            bcrypt.compare(adminPassword, admin.password, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/auth/admin/login",
                            title: "bcrypt error",
                            detail: "bcrypt error"
                        }
                    });
                }

                // If everything goes allright it created jwt token and send a response sucess with jwt token
                if (result) {
                    let payload = { api_key: apiKey, email: admin.email };
                    let jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

                    return res.json({
                        data: {
                            type: "success",
                            message: "Admin logged in",
                            user: payload,
                            token: jwtToken
                        }
                    });
                }

                // If password is not the same as in database
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "/auth/admin/login",
                        title: "Wrong password",
                        detail: "Password is incorrect."
                    }
                });
            });
        } catch(e) {
            console.log(e);
        } finally {
            await client.close();
        }
    },

    adminRegister: async function(res, body) { // Register a new Admin
        const adminEmail = sanitize(body.email);
        const adminPassword = sanitize(body.password);
        const adminFirstName = sanitize(body.firstName);
        const adminLastName = sanitize(body.lastName);

        if (!adminEmail || !adminPassword) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/auth/admin/register",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        } else if (!adminFirstName || !adminLastName) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/auth/admin/register",
                    title: "First name or last name missing",
                    detail: "First name or last name missing in request"
                }
            });
        }

        // Find the email in database
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let admins_collection = db.collection("admins");
            let admin = await admins_collection.findOne({email: adminEmail});

            // If email found in database
            if (admin !== null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "/auth/admin/register",
                        title: "Admin alredy created",
                        detail: "Admin with provided email is alredy created in database."
                    }
                });
            }

            bcrypt.hash(adminPassword, 10, async function(err, hash) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/auth/admin/register",
                            title: "bcrypt error",
                            detail: "bcrypt error"
                        }
                    });
                }
    
                adminCreate = {
                    firstName: adminFirstName,
                    lastName: adminLastName,
                    email: adminEmail,
                    password: hash,
                }
    
                let clientRegister = new MongoClient(mongoURI);
                try {
                    let db = clientRegister.db("spark-rentals");
                    let admins_collection = db.collection("admins");
                    await admins_collection.insertOne(adminCreate);

                    return res.status(201).json({
                        data: {
                            message: "User successfully registered."
                        }
                    });
                } catch(e) {
                    console.log(e);
                } finally {
                    await clientRegister.close();
                }

                return res.status(500).json({
                    data: {
                        message: "Database error path: /auth/admin/register"
                    }
                });
            });
        } catch(e) {
            console.log(e);
        } finally {
            await client.close();
        }
    },

    adminCheckToken: function(req, res, next) { // Check the x-access-token from admin (Not need for user bcs it uses passport)
        let token = req.headers['x-access-token'];

        if (token) {
            jwt.verify(token, jwtSecret, function(err, decoded) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: req.path,
                            title: "Failed authentication",
                            detail: err.message
                        }
                    });
                }

                req.admin = {};
                req.admin.api_key = decoded.api_key;
                req.admin.email = decoded.email;

                next();

                return undefined;
            });
        } else {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: req.path,
                    title: "No token",
                    detail: "No token provided in request headers"
                }
            });
        }
    
    }
}

module.exports = auth;
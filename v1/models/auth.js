const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sanitize = require('mongo-sanitize'); // To prevent malicious users overwriting (NoSQL Injection)
const { MongoClient } = require("mongodb");
const mongoURI = process.env.DBURI;
const api_token = process.env.API_TOKEN
const jwtSecret = process.env.JWT_SECRET;

const auth = {
    checkAPIKey: async function(req, res, next) {  // Need to go through a check first for those request that don't need an API Key.
        if ( req.path == '/') { // Documentation
            return next();
        }

        if ( req.path == '/v1') { // Documentation
            return next();
        }

        if ( req.path == '/auth/login/google') { // Google
            return next();
        }

        if ( req.path == '/auth/google/callback') { // Google
            return next();
        }

        if ( req.path == '/auth/logout/google') { // Google
            return next();
        }

        if ( req.path == '/auth/login/google/error') { // Google
            return next();
        }

        auth.validAPIKey(req.query.api_key || req.body.api_key, next, req.path, res);
    },

    checkValidAdmin: async function(req, res, next) {
        if (req.body.api_key === process.env.REACT_APP_ADMIN_API_KEY || req.query.api_key === process.env.REACT_APP_ADMIN_API_KEY) {
            return auth.adminCheckToken(req, res, next);
        }

        return res.status(401).json({
            errors: {
                status: 401,
                source: req.path,
                title: "Not a admin",
                detail: "You don't have access to this area."
            }
        });
    },

    validTokenKey: async function(req, res, next) {  // Look if token is valid
        if (req.headers["x-access-token"] !== undefined) {
            if (req.body.api_key == process.env.REACT_APP_ADMIN_API_KEY || req.query.api_key == process.env.REACT_APP_ADMIN_API_KEY) {
                return auth.adminCheckToken(req, res, next);
            } else if (req.body.api_key == process.env.REACT_APP_USER_MOBILE_API_KEY || req.query.api_key == process.env.REACT_APP_USER_MOBILE_API_KEY) {
                return auth.userCheckToken(req, res, next);
            } else if (req.body.api_key == process.env.REACT_APP_USER_WEBB_API_KEY || req.query.api_key == process.env.REACT_APP_USER_WEBB_API_KEY) {
                return auth.userCheckToken(req, res, next);
            }
        } else if (req.user) {
            return auth.userAuthenticated(req, res, next);
        }

        return res.status(401).json({
            errors: {
                status: 401,
                source: req.path,
                title: "Valid Token key",
                detail: "No valid Token key provided."
            }
        });
    },

    validAPIKey: async function(apiKey, next, path, res) {  // Check if it's correct API KEY
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
        
        return next();
    },

    adminLogin: async function(res, body, path) { // Admin login
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
                        source: "POST /auth" + path,
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
                            source: "POST /auth" + path,
                            title: "bcrypt error",
                            detail: "bcrypt error"
                        }
                    });
                }

                // If everything goes allright it created jwt token and send a response sucess with jwt token
                if (!result) {
                    // If password is not the same as in database
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "POST /auth" + path,
                                title: "Wrong password",
                            detail: "Password is incorrect."
                        }
                    });
                }
                let payload = { api_key: apiKey, email: admin.email };
                let jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: 60 * 60 });

                return res.json({
                    data: {
                        type: "success",
                        message: "Admin logged in",
                        user: payload,
                        token: jwtToken
                    }
                });
            });
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
    },

    adminRegister: async function(res, body, path) { // Register a new Admin
        const adminEmail = sanitize(body.email);
        const adminPassword = sanitize(body.password);
        const adminFirstName = sanitize(body.firstName);
        const adminLastName = sanitize(body.lastName);

        // If adminEmail or adminPassword is undefined
        if (!adminEmail || !adminPassword) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST /auth" + path,
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        } else if (!adminFirstName || !adminLastName) { // If adminFirstName or adminLastName is undefined
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST /auth" + path,
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
                client.close();
                return res.status(401).json({
                    errors: {
                        status: 403,
                        source: "POST /auth" + path,
                        title: "Admin alredy created",
                        detail: "Admin with provided email is alredy created in database."
                    }
                });
            }

            // bcrypt the password
            bcrypt.hash(adminPassword, 10, async function(err, hash) {
                if (err) {
                    client.close();
                    return res.status(500).json({ // if error with bcrypt
                        errors: {
                            status: 500,
                            source: "POST /auth" + path,
                            title: "bcrypt error",
                            detail: "bcrypt error"
                        }
                    });
                }
    
                // create a admin object
                adminCreate = {
                    firstName: adminFirstName,
                    lastName: adminLastName,
                    email: adminEmail,
                    password: hash,
                }

                // Insert the admin object to the database
                await admins_collection.insertOne(adminCreate);
                client.close();

                // Return sucess
                return res.status(201).json({
                    data: {
                        message: "User successfully registered."
                    }
                });
            });
        } catch(e) { return res.status(500).send(); }
    },

    adminCheckToken: function(req, res, next) { // Check the x-access-token from admin
        let token = req.headers['x-access-token'];

        if (!token) {
            return res.status(401).json({ // If no token in request headers response with error code 401
                errors: {
                    status: 401,
                    source: req.path,
                    title: "No admin token",
                    detail: "No admin token provided in request headers"
                }
            });
        }

        jwt.verify(token, jwtSecret, function(err, decoded) { // Verify the token
            if (err) {
                return res.status(500).json({ // If error response with error code 500
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

            return next(); // sucess
        });
    
    },

    userAuthenticated: function(req,res,next) {
        if (req.user || req.isAuthenticated()) {
            return next();
        } else {
            res.status(401).send("You mustlogin first!")
        }
    },

    userLogin: async function(res, body, path) { // Admin login
        const userEmail = sanitize(body.email);
        const userPassword = sanitize(body.password);
        const apiKey = sanitize(body.api_key);

        // If userEmail or userPassword is undefined
        if (!userEmail || !userPassword) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST /auth" + path,
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        // Find the email in database
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let users_collection = db.collection("users");
            let user = await users_collection.findOne({email: userEmail});

            // If email not found in database
            if (user === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "POST auth" + path,
                        title: "User not found",
                        detail: "User with provided email not found."
                    }
                });
            }

            // Compare bcrypt password in database with password sent in.
            bcrypt.compare(userPassword, user.password, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "POST auth" + path,
                            title: "bcrypt error",
                            detail: "bcrypt error"
                        }
                    });
                }

                // If everything goes allright it creates a jwt token and send a response sucess with jwt token
                if (result) {
                    let payload = {id: user._id, email: user.email };
                    let jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: 60 * 60 });

                    return res.json({
                        data: {
                            type: "success",
                            message: "User logged in",
                            user: payload,
                            token: jwtToken
                        }
                    });
                }

                // If password is not the same as in database
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "POST auth" + path,
                        title: "Wrong password",
                        detail: "Password is incorrect."
                    }
                });
            });
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
    },

    userRegister: async function(res, body, path) { // Register a new Admin
        const userEmail = sanitize(body.email);
        const userPassword = sanitize(body.password);
        const userFirstName = sanitize(body.firstName);
        const userLastName = sanitize(body.lastName);
        const userPhoneNumber = sanitize(body.phoneNumber);

        // If adminEmail or adminPassword is undefined
        if (!userEmail || !userPassword) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST auth" + path,
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        } else if (!userFirstName || !userLastName) { // If userFirstName or userLastName is undefined
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST auth" + path,
                    title: "First name or last name missing",
                    detail: "First name or last name missing in request"
                }
            });
        } else if (!userPhoneNumber) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST auth" + path,
                    title: "Phonenumber missing",
                    detail: "Phonenumber missing missing in request"
                }
            });
        }

        // Find the email in database
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let users_collection = db.collection("users");
            let user = await users_collection.findOne({email: userEmail});

            // If email found in database
            if (user !== null) {
                return res.status(401).json({
                    errors: {
                        status: 403,
                        source: "POST auth" + path,
                        title: "User alredy created",
                        detail: "User with provided email is alredy created in database."
                    }
                });
            }

            // bcrypt the password
            bcrypt.hash(userPassword, 10, async function(err, hash) {
                if (err) {
                    return res.status(500).json({ // if error with bcrypt
                        errors: {
                            status: 500,
                            source: "POST auth" + path,
                            title: "bcrypt error",
                            detail: "bcrypt error"
                        }
                    });
                }
    
                // create a admin object
                userCreate = {
                    googleId: null,
                    firstName: userFirstName,
                    lastName: userLastName,
                    phoneNumber: userPhoneNumber,
                    email: userEmail,
                    password: hash,
                    balance: 0,
                    history: []
                }

                let findUser = null;
                let registerClient = new MongoClient(mongoURI);
                try {
                    let db = registerClient.db("spark-rentals");
                    let users_collection = db.collection("users");
                    await users_collection.insertOne(userCreate);
                    findUser = await users_collection.findOne({email: userEmail});
                } catch(e) { return res.status(500); } finally { await client.close(); }

                return res.status(201).json({
                    data: {
                        userId: findUser._id,
                        message: "User successfully registered."
                    }
                });
            });
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
    },

    userCheckToken: function(req, res, next) { // Check the x-access-token from user
        let token = req.headers['x-access-token'];

        if (!token) {
            return res.status(401).json({ // If no token in request headers response with error code 401
                errors: {
                    status: 401,
                    source: req.path,
                    title: "No user token",
                    detail: "No user token provided in request headers"
                }
            });
        }

        jwt.verify(token, jwtSecret, function(err, decoded) { // Verify the token
            if (err) {
                return res.status(500).json({ // If error response with error code 500
                    errors: {
                        status: 500,
                        source: req.path,
                        title: "Failed authentication",
                        detail: err.message
                    }
                });
            }

            req.user = {};
            req.user.api_key = decoded.api_key;
            req.user.email = decoded.email;

            return next();
        });
    
    },
}

module.exports = auth;
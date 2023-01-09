const bcrypt = require('bcryptjs');
const sanitize = require('mongo-sanitize'); // To prevent malicious users overwriting (NoSQL Injection)
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = process.env.DBURI;

const users = {
    getAllUsers: async function(res, path) {
        let users = null;

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let users_collection = db.collection("users");
            users = await users_collection.find().toArray();
        } catch(e) { res.status(500).send(); } finally { await client.close(); }

        // If nothing in users db collection
        if (users === null || !users.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /users" + path,
                    title: "Users collection is empty",
                    detail: "Users collection is empty in database."
                }
            });
        }
        
        res.status(200).send({ users }); // Sends the whole collection data
    },

    deleteUser: async function(res, user_id, path) {
        let userId = sanitize(user_id)
        let answer = null;

        // Check if the userId are valid MongoDB id.
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The user_id is not a valid id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let users_collection = db.collection("users");
            answer = await users_collection.deleteOne({_id: ObjectId(userId)});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
        
        if (answer.deletedCount <= 0) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "DELETE /users" + path,
                    title: "User not exists in database",
                    detail: "The user dosen't exists in database with the specified user_id."
                }
            });
        }
        
        return res.status(204).send();
    },

    editUser: async function(res, body, path) {
        let userId = sanitize(body.user_id);
        let updateFields = {};
        let userDataField = {
            googleId: "String",
            firstName: "String",
            lastName: "String",
            phoneNumber: "String",
            email: "String",
            password: "String",
            balance: "Float",
        }

        // Check if the userId are valid MongoDB id.
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The user_id is not a valid id."
                }
            });
        };    

        // Lookup if the user exists in database
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let users_collection = db.collection("users");
            let user = await users_collection.findOne({_id: ObjectId(userId)});

            // If the user dosen't exists
            if (user === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT /users" + path,
                        title: "User not exists in database",
                        detail: "The user dosen't exists in database with the specified user_id."
                    }
                });
            }

            // Put in the data the client has requested to update
            for (const field in userDataField) {
                if (body[field] !== undefined) {
                    if (field === "password") { // If it's a password it needs to be encrypted
                        bcrypt.hash(sanitize(body[field]), 10, async function(err, hash) {
                            if (err) {
                                return res.status(500).json({ // if error with bcrypt
                                    errors: {
                                        status: 500,
                                        source: "PUT /users",
                                        title: "bcrypt error",
                                        detail: "bcrypt error"
                                    }
                                });
                            }
                            updateFields[field] = hash;
                        })
                    } else if (field == "balance") {
                        updateFields[field] = parseFloat(sanitize(body[field]));
                    } else {
                        updateFields[field] = sanitize(body[field]);
                    }
                    
                }
            }

            await users_collection.updateOne({_id: ObjectId(userId)}, {$set: updateFields}); // Update the fields in the specific user

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        return res.status(204).send(); // Everything went good
    },

    getSpecificUser: async function(res, user_id, path) {
        let userId = sanitize(user_id);
        let user = null;

        // Check if the scooterId are valid MongoDB id.
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The user_id is not a valid id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let users_collection = db.collection("users");
            user = await users_collection.findOne({_id: ObjectId(userId)});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // If nothing in users db collection
        if (user === null || !Object.keys(user).length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /users" + path,
                    title: "User not exists in database",
                    detail: "The User dosen't exists in database with the specified user_id."
                }
            });
        }

        res.status(200).send({ user }); // Sends data from the specific user
    },

    getSpecificGoogleUser: async function(res, google_id, path) {
        let googleId = sanitize(google_id);
        let user = null;

        // Check if the scooterId are valid MongoDB id.
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The user_id is not a valid id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let users_collection = db.collection("users");
            user = await users_collection.findOne({googleId: ObjectId(googleId)});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // If nothing in users db collection
        if (user === null || !Object.keys(user).length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /users" + path,
                    title: "User not exists in database",
                    detail: "The User dosen't exists in database with the specified user_id."
                }
            });
        }

        res.status(200).send({ user }); // Sends data from the specific user
    },

    getUserHistory: async function(res, user_id, path) {
        let userId = sanitize(user_id);
        let userHistory = null;

        // Check if the scooterId are valid MongoDB id.
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The user_id is not a valid id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let users_collection = db.collection("users");
            userHistory = await users_collection.findOne({_id: ObjectId(userId)}).project({history: 1});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // If nothing in users db collection
        if (userHistory === null) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /users" + path,
                    title: "User history not exists in database",
                    detail: "The User history dosen't exists in database with the specified user_id."
                }
            });
        }

        res.status(200).send({ userHistory }); // Sends data from the specific user
    },

    getUserDetails: async function(res, user_id, history_id, path) {
        let userId = sanitize(user_id);
        let userDetails = null;

        // Check if the userId are valid MongoDB id.
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The user_id is not a valid id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let users_collection = db.collection("users");
            userDetails = await users_collection.findOne({_id: ObjectId(user_id), "history._id": ObjectId(history_id)});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // If nothing in users db collection
        if (userDetails === null) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /users" + path,
                    title: "User history details not exists in database",
                    detail: "The User history details dosen't exists in database with the specified user_id."
                }
            });
        }

        res.status(200).send({ userDetails }); // Sends data from the specific user
    },

    addUserFunds: async function(res, body, path) {
        let user = null;
        let prepaid = null;
        let userId = sanitize(body.user_id);
        let prepaidCode = sanitize(body.prepaid_code);

        // Check if the userId are valid MongoDB id.
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The user_id is not a valid id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let users_collection = db.collection("users");
            user = await users_collection.findOne({_id: ObjectId(userId)});

            // If nothing in users db collection
            if (user === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "GET /users" + path,
                        title: "User not exists in database",
                        detail: "The User dosen't exists in database with the specified user_id."
                    }
                });
            }

            let prepaidsClient = new MongoClient(mongoURI);
            try {
                let db = prepaidsClient.db("spark-rentals");
                let prepaids_collection = db.collection("prepaid");
                prepaid = await prepaids_collection.findOne({code: prepaidCode});

                // If nothing in prepaid db collection
                if (prepaid === null || !Object.keys(prepaid).length) {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "POST /users" + path,
                            title: "Prepaid not exists in database",
                            detail: "The Prepaid dosen't exists in database with the specified prepaid_code."
                        }
                    });
                }
                
                // If prepaid has no more uses left it deletes
                if (prepaid.usesLeft < 1) {
                    answer = await prepaids_collection.deleteOne({code: prepaidCode});
                    return res.status(410).json({
                        errors: {
                            status: 401,
                            source: "POST /users" + path,
                            title: "No prepaid card uses left",
                            detail: "The prepaid has not any uses left"
                        }
                    });
                }

                // If prepaid has no more uses left it deletes
                if (prepaid.users.includes(userId)) {
                    return res.status(410).json({
                        errors: {
                            status: 401,
                            source: "POST /users" + path,
                            title: "The user has already registered with this code",
                            detail: "The user_id alredy exists in the prepaid code users"
                        }
                    });
                } else {
                   prepaid.users.push(userId) 
                }

                await prepaids_collection.updateOne({code: prepaidCode}, {$set: {usesLeft: prepaid.usesLeft - 1, users: prepaid.users}}); // Update the uses in the specific prepaid
            } catch(e) { return res.status(500).send(); } finally { await prepaidsClient.close(); }
            await users_collection.updateOne({_id: ObjectId(userId)}, {$set: {balance: user.balance + prepaid.amount}}); // Update the balance in the specific user
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        return res.status(204).send(); // Everything went good
    }
}

module.exports = users;
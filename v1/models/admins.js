const bcrypt = require('bcryptjs');
const sanitize = require('mongo-sanitize'); // To prevent malicious users overwriting (NoSQL Injection)
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = process.env.DBURI;

const admins = {
    // Field for editing admins
    editFields: {
        firstName: "firstName",
        lastName: "lastName",
        email: "email",
        password: "password"
    },

    // Get all admins information
    getAdmins: async function(res, path) {
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let admins_collection = db.collection("admins");
            let admins = await admins_collection.find().toArray();

            // If nothing in db collection
            if (admins === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "GET /admins" + path,
                        title: "Admins collection is empty",
                        detail: "Admins collection is empty in database."
                    }
                });
            }

            res.status(200).send({ admins }); // Sends the whole collection with data

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
    },

    // Get specific admin information
    getSpecificAdmin: async function(res, admin_id, path) {
        let adminId = sanitize(admin_id);

        // Check if the adminId are a valid MongoDB id.
        if (!ObjectId.isValid(adminId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The admin_id is not a valid MongoDB id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let admins_collection = db.collection("admins");
            let admin = await admins_collection.findOne({_id: ObjectId(adminId)});

            // If nothing in collection
            if (admin === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "GET /admins" + path,
                        title: "Admin not exists in database",
                        detail: "The admin dosen't exists in database with the specified admin_id."
                    }
                });
            }

            res.status(200).send({ admin }); // Sends data from the specific admin

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
    },

    // Delete specific admin
    deleteAdmin: async function(res, admin_id, path) {
        let adminId = sanitize(admin_id)

        // Check if the adminId are a valid MongoDB id.
        if (!ObjectId.isValid(adminId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The admin_id is not a valid MongoDB id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let admins_collection = db.collection("admins");
            let admins = await admins_collection.findOne({_id: ObjectId(adminId)});

            // If nothing in db collection
            if (admins === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "DELETE /admins" + path,
                        title: "Admin not exists in database",
                        detail: "The admin dosen't exists in database with the specified admin_id."
                    }
                });
            }

            // Delete the admin by id
            await admins_collection.deleteOne( { "_id" : ObjectId(adminId) } );

            return res.status(204).send();

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
    },

    // Edit specific admin
    editAdmin: async function(res, body, path) {
        let adminId = sanitize(body.admin_id)
        let updateFields = {};

        // Check if the adminId are a valid MongoDB id.
        if (!ObjectId.isValid(adminId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The admin_id is not a valid MongoDB id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let admins_collection = db.collection("admins");
            let admin = await admins_collection.findOne({_id: ObjectId(adminId)});

            // If nothing in db collection
            if (admin === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT /admins" + path,
                        title: "Admin not exists in database",
                        detail: "The admin dosen't exists in database with the specified admin_id."
                    }
                });
            }

            for (const field in admins.editFields) {
                if (body[field] !== undefined) {
                    if (field === "password") { // If it's a password it needs to be encrypted
                        bcrypt.hash(sanitize(body[field]), 10, async function(err, hash) {
                            if (err) {
                                return res.status(500).json({ // if error with bcrypt
                                    errors: {
                                        status: 500,
                                        source: "PUT /admins" + path,
                                        title: "bcrypt error",
                                        detail: "bcrypt error"
                                    }
                                });
                            }
                            updateFields[field] = hash;
                        })
                    } else {
                        updateFields[field] = sanitize(body[field]); 
                    }
                }
            }

            // Update the admin fields
            await admins_collection.updateOne({_id: ObjectId(adminId)}, {$set: updateFields }); // Update the admin information

            return res.status(204).send(); // Everything went good

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
    }
}

module.exports = admins;
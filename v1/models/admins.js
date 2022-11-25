const bcrypt = require('bcryptjs');
const sanitize = require('mongo-sanitize'); // To prevent malicious users overwriting (NoSQL Injection)
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";

const admins = {
    // Field for editing admins
    editFields: {
        firstName: "firstName",
        lastName: "lastName",
        email: "email",
        password: "password"
    },

    // Get all admins information
    getAdmins: async function(res) {
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
                        source: "GET /admins",
                        title: "Admins collection is empty",
                        detail: "Admins collection is empty in database."
                    }
                });
            }

            res.status(200).send({ admins }); // Sends the whole collection data // Kanske skicka en status på denna ?

        } catch(e) {
            console.log(e);
            return res.status(500).send(); // Internal Server Error
        } finally {
            await client.close();
        }
    },

    // Get specific admin information
    getSpecificAdmin: async function(res, adminId, status=200) {
        let adminID = sanitize(adminId);
        if(adminID.length === 24) { // Needs to be a string with 24 hex characters.
            let client = new MongoClient(mongoURI);
            try {
                let db = client.db("spark-rentals");
                let admins_collection = db.collection("admins");
                let admin = await admins_collection.findOne({_id: ObjectId(adminID)});

                // If nothing in collection
                if (admin === null) {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "GET /admins/:admin_id",
                            title: "Admin not exists in database",
                            detail: "The admin dosen't exists in database with the specified admin_id."
                        }
                    });
                }

                res.status(status).send({ admin }); // Sends data from the specific admin

            } catch(e) {
                console.log(e);
                return res.status(500).send(); // Internal Server Error
            } finally {
                await client.close();
            }  
        } else {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute adminID must be a string of 24 hex characters."
                }
            });
        }
    },

    // Delete specific admin
    deleteAdmin: async function(res, body) {
        let adminId = sanitize(body.adminID)
        if(adminId.length === 24) {
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
                            source: "DELETE /admins",
                            title: "Admin not exists in database",
                            detail: "The admin dosen't exists in database with the specified admin_id."
                        }
                    });
                }
                let deleteClient = new MongoClient(mongoURI);
                try {
                    let db = deleteClient.db("spark-rentals");
                    let admins_collection = db.collection("admins");
                    await admins_collection.deleteOne( { "_id" : ObjectId(adminId) } );
                } catch(e) {
                    console.log(e);
                    return res.status(500).send();
                } finally {
                    await deleteClient.close()
                }

                return res.status(204).send();

            } catch(e) {
                console.log(e);
                return res.status(500).send();
            } finally {
                await client.close();
            }
        } else {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute adminID must be a string of 24 hex characters."
                }
            });
        }
    },

    // Edit specific admin
    editAdmin: async function(res, body) {
        let adminId = sanitize(body.adminID)
        let updateFields = {};
        if(adminId.length === 24) {
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
                            source: "PUT /admin",
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
                                            source: "PUT /admin",
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

                let editClient = new MongoClient(mongoURI);
                try {
                    let db = editClient.db("spark-rentals");
                    let admins_collection = db.collection("admins");
                    await admins_collection.updateOne({_id: ObjectId(adminId)}, {$set: updateFields }); // Update the admin information
                } catch(e) {
                    console.log(e);
                    return res.status(500).send();
                } finally {
                    await editClient.close()
                }

                return res.status(204).send(); // Everything went good

            } catch(e) {
                console.log(e);
                return res.status(500).send();
            } finally {
                await client.close();
            }

        } else {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute adminID must be a string of 24 hex characters."
                }
            });
        }
    }
}

module.exports = admins;
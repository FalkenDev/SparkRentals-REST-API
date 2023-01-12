const bcrypt = require('bcryptjs');
var hat = require('hat');
const sanitize = require('mongo-sanitize'); // To prevent malicious users overwriting (NoSQL Injection)
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = process.env.DBURI;

const prepaids = {
    getAllPrepaids: async function(res) {
        let prepaids = null;

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let prepaids_collection = db.collection("prepaid");
            prepaids = await prepaids_collection.find().toArray();
        } catch(e) { res.status(500).send(); } finally { await client.close(); }

        // If nothing in db collection
        if (prepaids === null || !prepaids.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET prepaids" + path,
                    title: "Prepaids collection is empty",
                    detail: "Prepaids collection is empty in database."
                }
            });
        };
        res.status(200).send({ prepaids }); // Sends the whole collection data
    },
    
    getSpeceifcPrepaid: async function(res, prepaid_id) {
        let prepaidId = sanitize(prepaid_id); // Sanitize to prevent SQL Injection Attacks.
        let prepaid = null;

        // Check if the prepaid_id are a valid MongoDB id.
        if (!ObjectId.isValid(prepaidId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The prepaid_id is not a valid MongoDB id."
                }
            });
        }

        // Get the specific prepaid with the prepaidId
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let prepaids_collection = db.collection("prepaid");
            prepaid = await prepaids_collection.findOne({_id: ObjectId(prepaidId)});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // If nothing in collection with the specific prepaidId
        if (prepaid === null || !Object.keys(prepaid).length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET cities" + path,
                    title: "Prepaid not exists in database",
                    detail: "The prepaid dosen't exists in database with the specified prepaid_id."
                }
            });
        }

        res.status(200).send({ prepaid }); // Sends data from the specific admin
    },

    registerPrepaid: async function(res, body) {
        const totalUses = sanitize(body.total_uses)
        let prepaidCode = sanitize(body.code);
        const prepaidAmount = parseFloat(sanitize(body.amount));

        // Check if something is missing
        if (!prepaidAmount || ! totalUses) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST prepaids" + path,
                    title: "Attribute missing",
                    detail: "A attribute is missing in body request"
                }
            });
        }

        if (prepaidCode == undefined) {
            prepaidCode = hat()
        }

        // Create prepaid data field
        let prepaidDataField = {
            code: prepaidCode,
            totalUses: parseInt(totalUses),
            users: [],
            usesLeft: parseInt(totalUses),
            amount: parseFloat(prepaidAmount)
        }

        // Insert the registered data
        let registerClient = new MongoClient(mongoURI);
        try {
            let db = registerClient.db("spark-rentals");
            let prepaids_collection = db.collection("prepaid");
            await prepaids_collection.insertOne(prepaidDataField);

            res.status(204).send(); // Everything went good
        } catch(e) { return res.status(500).send(); } finally { await registerClient.close(); }
    },

    deletePrepaid: async function(res, prepaid_id) {
        let prepaidId = sanitize(prepaid_id)
        let answer = null;

        // Check if the prepaidId are a valid MongoDB id.
        if (!ObjectId.isValid(prepaidId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The prepaid_id is not a valid MongoDB id."
                }
            });
        }

        // Delete the specific prepaid
        let client = new MongoClient(mongoURI);
        try {
                let db = client.db("spark-rentals");
                let prepaids_collection = db.collection("prepaid");
                answer = await prepaids_collection.deleteOne({_id: ObjectId(prepaidId)});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // Check if nothing has been deleted in MongoDB = the prepaid_id dosen't exists
        if (answer.deletedCount <= 0) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "DELETE prepaids" + path,
                    title: "Prepaid not exists in database",
                    detail: "The prepaid card dosen't exists in database with the specified prepaid_id."
                }
            });
        } else {
            return res.status(204).send(); // Everything went good
        }
    },

    editPrepaid: async function(res, body) {
        let prepaidId = sanitize(body.prepaid_id);
        let updateFields = {};
        let prepaidDataField = {
            code: "String",
            totalUses: "Int",
            users: "Array",
            usesLeft: "Int",
            amount: "Float"
        };

        // Check if the prepaidId are valid MongoDB id.
        if (!ObjectId.isValid(prepaidId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The prepaid_id is not a valid id."
                }
            });
        };    

        // Lookup if the prepaid exists in database
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let prepaids_collection = db.collection("prepaid");
            let prepaid = await prepaids_collection.findOne({_id: ObjectId(prepaidId)});

            // If the scooter dosen't exists
            if (prepaid === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT prepaids" + path,
                        title: "Prepaid not exists in database",
                        detail: "The prepaid dosen't exists in database with the specified prepaid_id."
                    }
                });
            }

            // Put in the data the client has requested to update
            for (const field in prepaidDataField) {
                if (body[field] !== undefined) {
                    if (field == "usesLeft" || field == "totalUses"){
                        updateFields[field] = parseInt(sanitize(body[field]));
                    } else if (field == "amount") {
                        updateFields[field] = parseFloat(sanitize(body[field]));
                    } else {
                        updateFields[field] = sanitize(body[field]);
                    }
                }
            }

            await prepaids_collection.updateOne({_id: ObjectId(prepaidId)}, {$set: updateFields}); // Update the fields in the specific prepaid

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        return res.status(204).send(); // Everything went good
    }

}

module.exports = prepaids;
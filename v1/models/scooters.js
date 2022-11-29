const sanitize = require('mongo-sanitize'); // To prevent malicious users overwriting (NoSQL Injection)
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";

const scooters = {

    scooterField: {
        owner: "City",
        coordinates: {
            longitude: "string",
            latitude: "string"
        },
        trip: {},
        battery: "Float",
        status: "string or int?",
        log: {}
    },

    // Get all scooters information
    getAllScooters: async function(res, path) {
        let client = new MongoClient(mongoURI);
        let scooters = null;

        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            scooters = await scooters_collection.find().toArray();
        } catch(e) { res.status(500).send(); } finally { console.log("Clienten stängs av!"); await client.close(); }

        // If nothing in db collection
        if (scooters === null || !scooters.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET scooters" + path,
                    title: "Scooters collection is empty",
                    detail: "Scooters collection is empty in database."
                }
            });
        }
        
        res.status(200).send({ scooters }); // Sends the whole collection data

    },

    // Register a scooter
    registerScooter: async function(res, body, path) {
        const scooterOwner = sanitize(body.owner);
        const scooterLongitude = sanitize(body.longitude);
        const scooterLatitude = sanitize(body.latitude);
        const scooterBattery = sanitize(body.battery);
        const scooterStatus = sanitize(body.status);

        if (!scooterOwner || !scooterLongitude || !scooterLatitude || !scooterBattery || !scooterStatus) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST scooters" + path,
                    title: "Attribute missing",
                    detail: "A attribute is missing in body request"
                }
            });
        }

        const statusList = ["Available", "In use", "Maintenance", "Unavailable", "Off"]
        if(!statusList.includes(scooterStatus)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute status must contain one of these statuses: " + statusList
                }
            });
        }

        let registerScooterDataField = {
            owner: scooterOwner,
            coordinates: {
                longitude: scooterLongitude,
                latitude: scooterLatitude
            },
            trip: {},
            battery: scooterBattery,
            status: scooterStatus,
            log: {}
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            await scooters_collection.insertOne(registerScooterDataField);

            res.status(204).send(); // Everything went good
        } catch(e) { return res.status(500).send(); } finally { console.log("Clienten stängs av!"); await client.close(); }
    },

    // Get all scooters overview
    getAllScootersOverview: async function(res, path) {
        let client = new MongoClient(mongoURI);
        let scootersOverview = null;
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            scootersOverview = await scooters_collection.find({}).project({"_id":1, "owner":1, "status":1, "coordinates":1, "battery":1}).toArray();
        } catch(e) { return res.status(500).send(); } finally { console.log("Clienten stängs av!"); await client.close(); }

        // If nothing in db collection
        if (scootersOverview === null || !scootersOverview.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET scooters" + path,
                    title: "Scooters collection is empty",
                    detail: "Scooters collection is empty in database."
                }
            });
        }

        res.status(200).send({ scootersOverview }); // Sends the whole collection data
    },

    // Get all scooters from a city
    getAllScootersCity: async function(res, owner_id, path) {
        let ownerId = sanitize(owner_id);
        console.log(ownerId);
        let client = new MongoClient(mongoURI);
        let cityScooters = null;
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            cityScooters = await scooters_collection.find({owner: ownerId}).toArray();
        } catch(e) { return res.status(500).send(); } finally { console.log("Clienten stängs av!"); await client.close(); }

        // If nothing in db collection
        if (cityScooters === null || !cityScooters.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET scooters" + path,
                    title: "No scooters at" + ownerId,
                    detail: "No scooters are registered at" + ownerId
                }
            });
        }

        res.status(200).send({ cityScooters }); // Sends the whole collection data // Kanske skicka en status på denna ?

    },

    // Get a specific scooter
    getSpecificScooter: async function(res, scooter_id, path) {
        let scooterId = sanitize(scooter_id);

        let scooter = null;

        if(scooterId.length !== 24) { // Needs to be a string with 24 hex characters.
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute scooter_id must be a string of 24 hex characters."
                }
            });
        }
        

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            scooter = await scooters_collection.findOne({_id: ObjectId(scooterId)});
        } catch(e) { return res.status(500).send(); } finally { console.log("Clienten stängs av!"); await client.close(); }

        // If nothing in collection
        if (scooter === null || !Object.keys(scooter).length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET scooters" + path,
                    title: "Scooter not exists in database",
                    detail: "The scooter dosen't exists in database with the specified scooter_id."
                }
            });
        }

        res.status(200).send({ scooter }); // Sends data from the specific admin
    },

    // Delete a specific scooter
    deleteScooter: async function(res, scooter_id, path) {
        let scooterId = sanitize(scooter_id)

        let answer = null;

        if(scooterId.length !== 24) { 
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute scooter_id must be a string of 24 hex characters."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
                let db = client.db("spark-rentals");
                let scooters_collection = db.collection("scooters");
                answer = await scooters_collection.deleteOne({_id: ObjectId(scooterId)});
        } catch(e) { return res.status(500).send(); } finally { console.log("Clienten stängs av!"); await client.close(); }
        
        if (answer.deletedCount <= 0) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET scooters" + path,
                    title: "Scooter not exists in database",
                    detail: "The scooter dosen't exists in database with the specified scooter_id."
                }
            });
        } else {
            return res.status(204).send();
        }
    },

    // Edit a specific scooter
    editScooter: async function(res, body, path) {
        let scooterId = sanitize(body.scooter_id)
        let updateFields = {};

        if (scooterId.length !== 24) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute scooter_id must be a string of 24 hex characters."
                }
            });
        }

        if(sanitize(body.status)) {
            const statusList = ["Available", "In use", "Maintenance", "Unavailable", "Off"]
            if(!statusList.includes(sanitize(body.status))) {
                return res.status(400).json({
                    errors: {
                        status: 400,
                        detail: "Required attribute status must contain one of these statuses: " + statusList
                    }
                });
            }  
        }
        

        // Lookup if the scooter exists in database
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            let scooter = await scooters_collection.findOne({_id: ObjectId(scooterId)});

            // If nothing in db collection
            if (scooter === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT scooters" + path,
                        title: "Scooter not exists in database",
                        detail: "The scooter dosen't exists in database with the specified scooterID."
                    }
                });
            }

            for (const field in scooters.scooterField) {
                if (field === "coordinates" && body.longitude && body.latitude) {
                    updateFields[field] = {
                        longitude: sanitize(body["longitude"]),
                        latitude: sanitize(body["latitude"])
                    }
                } else if (body[field] !== undefined) {
                    updateFields[field] = sanitize(body[field]);
                }
            }

            console.log(updateFields);

            await scooters_collection.updateOne({_id: ObjectId(scooterId)}, {$set: updateFields }); // Update the admin information

        } catch(e) { return res.status(500).send(); } finally { console.log("Clienten stängs av!"); await client.close(); }

        return res.status(204).send(); // Everything went good
    },

    // Edit a specific scooters status
    editStatusScooter: async function(res, body, path) {
        let scooterId = sanitize(body.scooter_id) // ID
        let scooterStatus = sanitize(body.status) // Status

        const statusList = ["Available", "In use", "Maintenance", "Unavailable", "Off"]
        if(!statusList.includes(scooterStatus)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute status must contain one of these statuses: " + statusList
                }
            });
        }
        if (scooterId.length !== 24) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute scooter_id must be a string of 24 hex characters."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            let scooter = await scooters_collection.findOne({_id: ObjectId(scooterId)});

            // If nothing in db collection
            if (scooter === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT scooters" + path,
                        title: "Scooter not exists in database",
                        detail: "The scooter dosen't exists in database with the specified scooter_id."
                    }
                });
            }

            await scooters_collection.updateOne({_id: ObjectId(scooterId)}, {$set: {status: scooterStatus} }); // Update the admin information

        } catch(e) { return res.status(500).send(); } finally { console.log("Clienten stängs av!"); await client.close(); }

        return res.status(204).send(); // Everything went good
    },

    // Edit a specific scooters position
    editPositionScooter: async function(res, body, path) {
        let scooterId = sanitize(body.scooter_id) // ID
        let scooterLongitude = sanitize(body.longitude) // Position longitude
        let scooterLatitude = sanitize(body.latitude) // Position latitude

        if(!scooterLongitude || !scooterLatitude) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute longitude and latitude must contain strings with position"
                }
            });
        }
        if (scooterId.length !== 24) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute scooter_id must be a string of 24 hex characters."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            let scooter = await scooters_collection.findOne({_id: ObjectId(scooterId)});

            // If nothing in db collection
            if (scooter === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT scooters" + path,
                        title: "Scooter not exists in database",
                        detail: "The scooter dosen't exists in database with the specified scooter_id."
                    }
                });
            };

            coordiantesField = {
                longitude: scooterLongitude,
                latitude: scooterLatitude
            };


            await scooters_collection.updateOne({_id: ObjectId(scooterId)}, {$set: {coordinates: coordiantesField} }); // Update the admin information

        } catch(e) { return res.status(500).send(); } finally { console.log("Clienten stängs av!"); await client.close(); }

        return res.status(204).send(); // Everything went good
    },

    // Rent a scooter
    rentScooter: async function(res, scooter_id, path) {
        let scooterId = sanitize(scooter_id);

        if (scooterId.length !== 24) { 
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute scooter_id must be a string of 24 hex characters."
                }
            });
        }
            let client = new MongoClient(mongoURI);
            try {
                let db = client.db("spark-rentals");
                let scooters_collection = db.collection("scooters");
                let scooter = await scooters_collection.findOne({_id: ObjectId(scooterId)});

                // If nothing in db collection
                if (scooter === null) {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "POST scooters" + path,
                            title: "Scooter not exists in database",
                            detail: "The scooter dosen't exists in database with the specified scooter_id."
                        }
                    });
                }

                // If nothing in db collection
                if (scooter.status !== "Available") {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "POST " + path,
                            title: "Scooter is not available",
                            detail: "The specified scooter is not available to rent. The status of the scooter is: " + scooter.status
                        }
                    });
                }

                await scooters_collection.updateOne({_id: ObjectId(scooterId)}, {$set: {status: "In use"} }); // Update the admin information

            } catch(e) { return res.status(500).send(); } finally { console.log("Clienten stängs av!"); await client.close(); }

            res.status(204).send(); // Everything went good
    },

    // Stop a scooter
    stopScooter: async function(res, scooter_id, path) {
        let scooterId = sanitize(scooter_id);

        let totalPrice = 0;
        let totalMin = 0;
        let totalKm = 0;
        let endPosition = {
            longitude: "string",
            latitude: "string"
        }

        if (scooterId.length !== 24) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute scooter_id must be a string of 24 hex characters."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            let scooter = await scooters_collection.findOne({_id: ObjectId(scooterId)});

            // If nothing in db collection
            if (scooter === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "POST scooters" + path,
                        title: "Scooter not exists in database",
                        detail: "The scooter dosen't exists in database with the specified scooter_id."
                    }
                });
            }

            // If nothing in db collection
            if (scooter.status !== "In use") {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "POST " + path,
                        title: "Scooter is not in use",
                        detail: "The specified scooter is not in use to stop the rent."
                    }
                });
            }

            await scooters_collection.updateOne({_id: ObjectId(scooterId)}, {$set: {status: "Available"} }); // Update the admin information
        } catch(e) { return res.status(500).send(); } finally { console.log("Clienten stängs av!"); await editClient.close(); }

        // Hämtar owner, startPositon, currentPosition, startTime och kollar vilken tid det är nu.
        // Hämtar stadens info (zones och taxRates) genom att skicka in scooter owner

        // Kollar vilken startPosition usern startade biken och lägger till det i rates ( fakutran(totalPrice) ) beroende på vilken zon usern startade i.
        // Kollar vilken currentPosition ( End pos ) usern slutade biken och lägger till det i rates ( fakutran(totalPrice) ) beroende på vilken zon usern slutade i.
        // !!! Hur ska jag veta vilken zon usern är i ? !!!
    
        // tar current time - start time och gångar det med timeRate och lägger in det i fakturan (totalPrice).
        // Lägger in fixedRate i fakturan (totalPrice).

        
        return res.status(200).send(); // Everything went good

    }
}

module.exports = scooters;
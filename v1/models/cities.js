const sanitize = require('mongo-sanitize'); // To prevent malicious users overwriting (NoSQL Injection)
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = process.env.DBURI;

const cities = {
    getAllCitiesInformation: async function(res, path) {
        let cities = null;

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let cities_collection = db.collection("cities");
            cities = await cities_collection.find().toArray();
        } catch(e) { res.status(500).send(); } finally { await client.close(); }

        // If nothing in db collection
        if (cities === null || !cities.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /cities" + path,
                    title: "Cities collection is empty",
                    detail: "Cities collection is empty in database."
                }
            });
        };
        res.status(200).send({ cities }); // Sends the whole collection data
    },
    
    registerCity: async function(res, body, path) {
        // Get everything for register a city
        const cityName = sanitize(body.name);
        const cityFixedRate = sanitize(body.fixedRate);
        const cityTimeRate= sanitize(body.timeRate);
        const cityBonusParkingZoneRate = sanitize(body.bonusParkingZoneRate);
        const cityParkingZoneRate = sanitize(body.parkingZoneRate);
        const cityNoParkingZoneRate = sanitize(body.noParkingZoneRate);
        const cityNoParkingToValidParking = sanitize(body.noParkingToValidParking);
        const cityChargingZoneRate = sanitize(body.chargingZoneRate);

        // Check if something is missing
        if (!cityName || !cityFixedRate || !cityTimeRate || !cityBonusParkingZoneRate || !cityParkingZoneRate || !cityNoParkingZoneRate || !cityNoParkingToValidParking) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST /cities" + path,
                    title: "Attribute missing",
                    detail: "A attribute is missing in body request"
                }
            });
        }

        // Get cities data
        let cities = null;
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let cities_collection = db.collection("cities");
            cities = await cities_collection.find().toArray();

            // Check if city alredy exists in database
            if (cities.some(e => e.name === cityName)) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "POST /cities" + path,
                        title: "City Alredy exists",
                        detail: "The city " + cityName + " alredy exists in database."
                    }
                });
            }

            // Create city data field
            let cityDataField = {
                name: cityName,
                taxRates: {
                    fixedRate: cityFixedRate,
                    timeRate: cityTimeRate,
                    bonusParkingZoneRate: cityBonusParkingZoneRate,
                    parkingZoneRate: cityParkingZoneRate,
                    noParkingZoneRate: cityNoParkingZoneRate,
                    noParkingToValidParking: cityNoParkingToValidParking,
                    chargingZoneRate: cityChargingZoneRate
                },
                zones: []
            }

            await cities_collection.insertOne(cityDataField);
            res.status(204).send(); // Everything went good

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
    },

    getAllCitiesOverview: async function(res, path) {
        let citiesOverview = null;
        let scootersOverview = null;
        let arrayOverview = [];

        // Get _id, name and zones data from all cities
        let citiesClient = new MongoClient(mongoURI);
        try {
            let db = citiesClient.db("spark-rentals");
            let cities_collection = db.collection("cities");
            citiesOverview = await cities_collection.find({}).project({"_id":1, "name":1, "zones":1}).toArray();
        } catch(e) { return res.status(500).send(); } finally { await citiesClient.close(); }

        // If nothing in db collection
        if (citiesOverview === null || !citiesOverview.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /cities" + path,
                    title: "Cities collection is empty",
                    detail: "Cities collection is empty in database."
                }
            });
        }

        // Get _id, owner and status data from all scooters
        let scooterClient = new MongoClient(mongoURI);
        try {
            let db = scooterClient.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            scootersOverview = await scooters_collection.find({}).project({"_id":1, "owner":1, "status":1}).toArray();
        } catch(e) { return res.status(500).send(); } finally { await scooterClient.close(); }

        // If nothing in db collection
        if (scootersOverview === null || !scootersOverview.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /cities" + path,
                    title: "Scooter collection is empty",
                    detail: "Scooter collection is empty in database."
                }
            });
        }

        // Loop through all cities
        for (const city of citiesOverview) {
            // Count what status a scooter have
            let totalScooters = 0
            let inUse = 0;
            let available = 0;
            let unavailable = 0;
            let maintenance = 0;
            let off = 0;

            // Check what status the scooter have and add + 1 to the variable
            for (const scooter of scootersOverview) {
                if (city.name === scooter.owner) {
                    totalScooters += 1
                    if (scooter.status == "In use") {
                        inUse += 1
                    } else if (scooter.status == "Available") {
                        available += 1
                    } else if (scooter.status == "Unavailable") {
                        unavailable += 1
                    } else if (scooter.status == "Maintenance") {
                        maintenance += 1
                    } else if (scooter.status == "Off") {
                        off += 1
                    }
                }
            }

            // Create a object with all the data that needs to be returned
            let object = {
                _id: city._id.toHexString(),
                name: city.name,
                totalScooters: totalScooters,
                totalInUse: inUse,
                totalAvailable: available,
                totalUnavailable: unavailable,
                totalMaintenance: maintenance,
                totalOff: off,
                totalZones: city.zones.length,
            }

            // Push it to the array
            arrayOverview.push(object);
        }

        // Send the custom made array with data.
        res.status(200).send({ arrayOverview }); // Sends the whole collection data
    },

    getSpecificCity: async function(res, city_id, path) {
        let cityId = sanitize(city_id); // Sanitize to prevent SQL Injection Attacks.
        let city = null;

        // Check if the cityId are a valid MongoDB id.
        if (!ObjectId.isValid(cityId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The city_id is not a valid MongoDB id."
                }
            });
        }

        // Get the specific city with the cityId
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let cities_collection = db.collection("cities");
            city = await cities_collection.findOne({_id: ObjectId(cityId)});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // If nothing in collection with the specific cityId
        if (city === null || !Object.keys(city).length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /cities" + path,
                    title: "City not exists in database",
                    detail: "The City dosen't exists in database with the specified city_id."
                }
            });
        }

        res.status(200).send({ city }); // Sends data from the specific admin
    },

    deleteCity: async function(res, city_id, path) {
        let cityId = sanitize(city_id)
        let answer = null;

        // Check if the cityId are a valid MongoDB id.
        if (!ObjectId.isValid(cityId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The city_id is not a valid MongoDB id."
                }
            });
        }

        // Delete the specific city
        let client = new MongoClient(mongoURI);
        try {
                let db = client.db("spark-rentals");
                let cities_collection = db.collection("cities");
                answer = await cities_collection.deleteOne({_id: ObjectId(cityId)});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // Check if nothing has been deleted in MongoDB = the city_id dosen't exists
        if (answer.deletedCount <= 0) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "DELETE /cities" + path,
                    title: "City not exists in database",
                    detail: "The City dosen't exists in database with the specified city_id."
                }
            });
        } else {
            return res.status(204).send(); // Everything went good
        }
    },

    editCity: async function(res, body, path) {
        let cityId = sanitize(body.city_id);
        let updateFields = {};
        let cityDataField = {
            name: "String",
            taxRates: {
                fixedRate: "Float",
                timeRate: "Float",
                bonusParkingZoneRate: "Float",
                parkingZoneRate: "Float",
                noParkingZoneRate: "Float",
                noParkingToValidParking: "Float",
                chargingZoneRate: "Float"
            },
            zones: []
        };

        // Check if the cityId are valid MongoDB id.
        if (!ObjectId.isValid(cityId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The city_id is not a valid id."
                }
            });
        };    

        // Lookup if the city exists in database
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let cities_collection = db.collection("cities");
            let city = await cities_collection.findOne({_id: ObjectId(cityId)});

            // If the scooter dosen't exists
            if (city === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT /cities" + path,
                        title: "City not exists in database",
                        detail: "The City dosen't exists in database with the specified scooterID."
                    }
                });
            }

            // Put in the data the client has requested to update
            for (const field in cityDataField) {
                if (body[field] !== undefined) {
                    updateFields[field] = sanitize(body[field]);
                }
            }

            await cities_collection.updateOne({_id: ObjectId(cityId)}, {$set: updateFields}); // Update the fields in the specific city

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        return res.status(204).send(); // Everything went good
    },

    editTaxRateFromCity: async function(res, body, path) {
        let cityId = sanitize(body.city_id)
        let updateFields = {};
        let taxRateDataField = {
            fixedRate: "Float",
            timeRate: "Float",
            bonusParkingZoneRate: "Float",
            parkingZoneRate: "Float",
            noParkingZoneRate: "Float",
            noParkingToValidParking: "Float",
            chargingZoneRate: "Float",
        }

        // Check if the cityId are valid MongoDb id.
        if (!ObjectId.isValid(cityId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The city_id is not a valid id."
                }
            });
        }

        // Lookup if the city exists in database
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let cities_collection = db.collection("cities");
            let city = await cities_collection.findOne({_id: ObjectId(cityId)});

            // Check if city dosen't exists in db collection
            if (city === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT vcities" + path,
                        title: "City not exists in database",
                        detail: "The City dosen't exists in database with the specified city_id."
                    }
                });
            }

            // Put in the data the client has requested to update
            for (const field in taxRateDataField) {
                if (body[field] !== undefined) {
                    updateFields[field] = parseInt(sanitize(body[field]));
                }
            }

            // Put in the old data that client has not requested to update
            updateFields = { ...city.taxRates, ...updateFields }

            await cities_collection.updateMany({_id: ObjectId(cityId)}, {$set: {taxRates: updateFields}}); // Update the admin information

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        return res.status(204).send(); // Everything went good
    },

    registerZone: async function(res, body, path) {
        const cityId = sanitize(body.city_id);
        const cityZoneType = sanitize(body.zoneType);
        const cityType = sanitize(body.type);
        const cityCoordinates = sanitize(body.coordinates);

        // Check if the cityId are valid MongoDB id.
        if (!ObjectId.isValid(cityId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The city_id is not a valid id."
                }
            });
        }

        // Check if the client have sent the required attributes
        if (!cityZoneType || !cityType || !cityCoordinates) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST /cities" + path,
                    title: "Attribute missing",
                    detail: "A attribute is missing in body request"
                }
            });
        }

        const zoneList = ["chargingZone", "noParkingZone", "bonusParkingZone", "parkingZone"]
        if(!zoneList.includes(cityZoneType)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute zoneType must contain one of these zones: " + zoneList
                }
            });
        }

        // Check if the city exists
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let cities_collection = db.collection("cities");
            let city = await cities_collection.findOne({_id: ObjectId(cityId)});

            // If city not exists in db collection
            if (city === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT /cities" + path,
                        title: "City not exists in database",
                        detail: "The City dosen't exists in database with the specified city_id."
                    }
                });
            }
        } catch(e) { res.status(500).send(); } finally { await client.close(); }

        // Insert the data to a zone object
        let zoneDataField = {
            _id: new ObjectId(),
            zoneType: body.zoneType,
            type: body.type,
            coordinates: body.coordinates
        }

        // Register the zone in the city
        let registerClient = new MongoClient(mongoURI);
        try {
            let db = registerClient.db("spark-rentals");
            let cities_collection = db.collection("cities");
            await cities_collection.updateOne({_id: ObjectId(cityId)}, {$push: {zones: zoneDataField} });

            res.status(204).send(); // Everything went good
        } catch(e) { return res.status(500).send(); } finally { await registerClient.close(); }
    },

    deleteZone: async function(res, body, path) {
        let cityId = sanitize(body.city_id);
        let zoneId = sanitize(body.zone_id);
        let answer = null;

        // Check if the ids are valid MongoDB ids.
        if (!ObjectId.isValid(cityId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The city_id is not a valid id."
                }
            });
        } else if (!ObjectId.isValid(zoneId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The zone_id is not a valid id."
                }
            });
        }

        // Delete the zone
        let client = new MongoClient(mongoURI);
        try {
                let db = client.db("spark-rentals");
                let cities_collection = db.collection("cities");
                answer = await cities_collection.updateOne({_id: ObjectId(cityId)}, {$pull: {zones: {_id: ObjectId(zoneId)}}});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // Check if nothing has been deleted in MongoDB = the zone_id dosen't exists
        if (answer.deletedCount <= 0) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "DELETE /cities" + path,
                    title: "Zone not exists in database",
                    detail: "The Zone dosen't exists in database with the specified city_id and zone_id."
                }
            });
        } else {
            return res.status(204).send();
        }
    },

    editZone: async function(res, body, path) {
        let cityId = sanitize(body.city_id);
        let zoneId = sanitize(body.zone_id);
        let updateFields = {};

        // Check if the ids are valid MongoDB ids.
        if (!ObjectId.isValid(cityId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The city_id is not a valid id."
                }
            });
        } else if (!ObjectId.isValid(zoneId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The zone_id is not a valid id."
                }
            });
        }

        // Create zone data field
        let zoneDataField = {
            zoneType: "String",
            type: "String",
            coordinates: "Array",
        }

        // Lookup if the specific city exists in database
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let cities_collection = db.collection("cities");
            let city = await cities_collection.findOne({_id: ObjectId(cityId)});

            // If city not exists in db collection
            if (city === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT /cities" + path,
                        title: "City not exists in database",
                        detail: "The City dosen't exists in database with the specified city_id."
                    }
                });
            }

            // Collect the specific zone
            let specificZone = city.zones.find(x => x._id == zoneId);

            // If the zone dosen't exists in the city
            if (specificZone === undefined) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "PUT cities" + path,
                        title: "Zone not exists in database",
                        detail: "The Zone dosen't exists in database with the specified zone_id."
                    }
                });
            }

            // Put in the data the client has requested to update
            for (const field in zoneDataField) {
                if (body[field] !== undefined) {
                    if (field === "zoneType") {
                        const zoneList = ["chargingZone", "noParkingZone", "bonusParkingZone", "parkingZone"]
                        if(!zoneList.includes(body[field])) {
                            return res.status(400).json({
                                errors: {
                                    status: 400,
                                    detail: "Required attribute zoneType must contain one of these zones: " + zoneList
                                }
                            });
                        }
                    }
                    updateFields[field] = sanitize(body[field]);
                }
            }

            // Put in the old data that client has not requested to update
            updateFields = { ...specificZone, ...updateFields }

            // Update the zone
            await cities_collection.updateOne({_id: ObjectId(cityId), "zones._id": ObjectId(zoneId)}, {$set: {"zones.$":  updateFields}});

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        return res.status(204).send(); // Everything went good
    }
}

module.exports = cities;
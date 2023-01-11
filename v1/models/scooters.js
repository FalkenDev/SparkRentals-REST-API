const sanitize = require('mongo-sanitize'); // To prevent malicious users overwriting (NoSQL Injection)
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = process.env.DBURI;
var classifyPoint = require("robust-point-in-polygon")

const scooters = {

    scooterField: {
        owner: "string",
        coordinates: {
            longitude: "string",
            latitude: "string"
        },
        trip: {},
        battery: "float",
        status: "string",
        log: {}
    },

    // Get all scooters information
    getAllScooters: async function(res, path) {
        let scooters = null;

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            scooters = await scooters_collection.find().toArray();
        } catch(e) { res.status(500).send(); } finally { await client.close(); }

        // If nothing in scooters db collection
        if (scooters === null || !scooters.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /scooters" + path,
                    title: "Scooters collection is empty",
                    detail: "Scooters collection is empty in database."
                }
            });
        }
        
        res.status(200).send({ scooters }); // Sends the whole collection data

    },

    // Register a scooter
    registerScooter: async function(res, body, path) {
        let nameNumber = 0;
        const scooterOwner = sanitize(body.owner);
        const scooterLongitude = sanitize(body.longitude);
        const scooterLatitude = sanitize(body.latitude);
        const scooterBattery = sanitize(body.battery);
        const scooterStatus = sanitize(body.status);

        // Check if missing a required attribute
        if (!scooterOwner || !scooterLongitude || !scooterLatitude || !scooterBattery || !scooterStatus) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST /scooters" + path,
                    title: "Attribute missing",
                    detail: "A attribute is missing in body request"
                }
            });
        }

        // Spell check on status
        const statusList = ["Available", "In use", "Maintenance", "Unavailable", "Off"]
        if(!statusList.includes(scooterStatus)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute status must contain one of these statuses: " + statusList
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            let scooters = await scooters_collection.find().toArray();
            nameNumber = scooters.length + 1;

            let registerScooterDataField = {
                name: `Spark-Rentals#${nameNumber.toString()}`,
                owner: scooterOwner,
                coordinates: {
                    longitude: parseFloat(scooterLongitude),
                    latitude: parseFloat(scooterLatitude)
                },
                trip: {},
                battery: parseInt(scooterBattery),
                status: scooterStatus,
                log: {}
            }
            await scooters_collection.insertOne(registerScooterDataField); // Register the scooter to the database
            res.status(204).send(); // Everything went good
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
    },

    // Get all scooters overview
    getAllScootersOverview: async function(res, path) {
        let scootersOverview = null;

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            scootersOverview = await scooters_collection.find({}).project({"_id":1, "name":1, "owner":1, "status":1, "coordinates":1, "battery":1}).toArray();
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // If nothing in db collection
        if (scootersOverview === null || !scootersOverview.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /scooters" + path,
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
        let cityScooters = null;

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            cityScooters = await scooters_collection.find({owner: ownerId}).toArray();
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // If nothing in scooters db collection
        if (cityScooters === null || !cityScooters.length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /scooters" + path,
                    title: "No scooters at" + ownerId,
                    detail: "No scooters are registered at" + ownerId
                }
            });
        }

        res.status(200).send({ cityScooters }); // Sends the whole collection data

    },

    // Get a specific scooter
    getSpecificScooter: async function(res, scooter_id, path) {
        let scooterId = sanitize(scooter_id);
        let scooter = null;

        // Check if the scooterId are valid MongoDB id.
        if (!ObjectId.isValid(scooterId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The scooter_id is not a valid id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            scooter = await scooters_collection.findOne({_id: ObjectId(scooterId)});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // If nothing in scooters db collection
        if (scooter === null || !Object.keys(scooter).length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /scooters" + path,
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

        // Check if the scooterId are valid MongoDB id.
        if (!ObjectId.isValid(scooterId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The city_id is not a valid id."
                }
            });
        }

        let client = new MongoClient(mongoURI);
        try {
                let db = client.db("spark-rentals");
                let scooters_collection = db.collection("scooters");
                answer = await scooters_collection.deleteOne({_id: ObjectId(scooterId)});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }
        
        if (answer.deletedCount <= 0) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "GET /scooters" + path,
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

        // Check if the scooterId are valid MongoDB id.
        if (!ObjectId.isValid(scooterId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The scooter_id is not a valid id."
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
                        source: "PUT /scooters" + path,
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

            await scooters_collection.updateOne({_id: ObjectId(scooterId)}, {$set: updateFields });

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        return res.status(204).send(); // Everything went good
    },

    // Edit a specific scooters status
    editStatusScooter: async function(res, body, path) {
        let scooterId = sanitize(body.scooter_id) // ID
        let scooterStatus = sanitize(body.status) // Status

        // Check if the scooterId are valid MongoDB id.
        if (!ObjectId.isValid(scooterId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The scooter_id is not a valid id."
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
                        source: "PUT /scooters" + path,
                        title: "Scooter not exists in database",
                        detail: "The scooter dosen't exists in database with the specified scooter_id."
                    }
                });
            }

            await scooters_collection.updateOne({_id: ObjectId(scooterId)}, {$set: {status: scooterStatus} });

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        return res.status(204).send(); // Everything went good
    },

    // Edit a specific scooters position
    editCoordinatesScooter: async function(res, body, path) {
        let scooterId = sanitize(body.scooter_id) // ID
        let scooterLongitude = sanitize(body.longitude) // Position longitude
        let scooterLatitude = sanitize(body.latitude) // Position latitude

        // Check if the scooterId are valid MongoDB id.
        if (!ObjectId.isValid(scooterId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The scooter_id is not a valid id."
                }
            });
        }

        if(!scooterLongitude || !scooterLatitude) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute longitude and latitude must contain strings with position"
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
                        source: "PUT /scooters" + path,
                        title: "Scooter not exists in database",
                        detail: "The scooter dosen't exists in database with the specified scooter_id."
                    }
                });
            };

            coordiantesField = {
                longitude: scooterLongitude,
                latitude: scooterLatitude
            };


            await scooters_collection.updateOne({_id: ObjectId(scooterId)}, {$set: {coordinates: coordiantesField} });

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        return res.status(204).send(); // Everything went good
    },

    // Rent a scooter
    rentScooter: async function(res, scooter_id, user_id, path) {
        let scooterId = sanitize(scooter_id);
        let userId = sanitize(user_id);
        let timeToday = new Date();

        // Check if the ids are valid MongoDB ids.
        if (!ObjectId.isValid(scooterId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The scooter_id is not a valid id."
                }
            });
        } else if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The user_id is not a valid id."
                }
            });
        };

        // Lookup if user exists with the specified user_id
        let userClient = new MongoClient(mongoURI);
        try {
            let db = userClient.db("spark-rentals");
            let user_collection = db.collection("users");
            let user = await user_collection.findOne({_id: ObjectId(userId)});

            // If nothing in db collection
            if (user === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "POST /scooters" + path,
                        title: "User not exists in database",
                        detail: "The user dosen't exists in database with the specified user_id."
                    }
                });
            }

            if (user.balance < 50) {
                return res.status(402).json({
                    errors: {
                        status: 401,
                        source: "POST /scooters" + path,
                        title: "Not enough balance",
                        detail: "The user does not have enough balance in their account. At least SEK 50 is required. The user balance is: " + user.balance + " SEK."
                    }
                });
            }
        } catch(e) { return res.status(500).send(); } finally { await userClient.close(); }

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
                        source: "POST /scooters" + path,
                        title: "Scooter not exists in database",
                        detail: "The scooter dosen't exists in database with the specified scooter_id."
                    }
                });
            }

            // Check if scooter is not available
            if (scooter.status !== "Available") {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "POST /scooters" + path,
                        title: "Scooter is not available",
                        detail: "The specified scooter is not available to rent. The status of the scooter is: " + scooter.status + "."
                    }
                });
            }

            // Create the trip object with information
            let trip = {
                date: timeToday.getFullYear()+'-'+(timeToday.getMonth()+1)+'-'+timeToday.getDate(),
                userId: userId,
                startPosition: {
                    longitude: scooter.coordinates.longitude,
                    latitude: scooter.coordinates.latitude
                },
                startTime: timeToday.getHours() + ":" + timeToday.getMinutes() + ":" + timeToday.getSeconds(),
                endTime: null,
                distance: 0
            }

            // Push the trip object to trip object in scooter and status to "In use"
            await scooters_collection.updateOne({_id: ObjectId(scooterId)}, {$set: {status: "In use", trip: trip} });

        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        res.status(204).send(); // Everything went good
    },

    calculateRidePrice: async function(res, scooter, endTime) {
        let totalPrice = 0;
        // Scooter start and end position
        let arrayStartPosition = [scooter.trip.startPosition.longitude, scooter.trip.startPosition.latitude]
        let arrayEndPosition = [scooter.coordinates.longitude, scooter.coordinates.latitude]

        // If user start or end in a zone
        let startInNoParkinZone = false;
        let endInNoParkinZone = false;
        let startInBonusParkinZone = false;
        let endInBonusParkinZone = false;
        let startInParkinZone = false;
        let endInParkinZone = false;
        let startInChargingZone = false;
        let endInChargingZone = false;

        // Count total seconds for the ride
        let startTimeSplit = scooter.trip.startTime.split(':');
        let endTimeSplit = endTime.split(':');
        let startTimeSeconds = (+startTimeSplit[0]) * 60 * 60 + (+startTimeSplit[1]) * 60 + (+startTimeSplit[2]); 
        let endTimeSeconds = (+endTimeSplit[0]) * 60 * 60 + (+endTimeSplit[1]) * 60 + (+endTimeSplit[2]);
        let totalTimeSeconds = endTimeSeconds - startTimeSeconds;

        // For display
        let totalMin = Math.round(totalTimeSeconds / 60);
        let totalSeconds = totalTimeSeconds - totalMin * 60;

        // Get the specific city with the scooter.owner
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let cities_collection = db.collection("cities");
            city = await cities_collection.findOne({name: scooter.owner});
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        // If nothing in collection with the specific cityId
        if (city === null || !Object.keys(city).length) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "POST /scooters" + path,
                    title: "City not exists in database",
                    detail: "The City dosen't exists in database with the specified scooter.owner."
                }
            });
        }

        // Get all the rates
        let fixedRate = city.taxRates.fixedRate;
        let timeRate = city.taxRates.timeRate;
        let bonusParkingZoneRate = city.taxRates.bonusParkingZoneRate;
        let parkingZoneRate = city.taxRates.parkingZoneRate;
        let noParkingZoneRate = city.taxRates.noParkingZoneRate
        let noParkingToValidParking = city.taxRates.noParkingToValidParking;
        let chargingZoneRate  = city.taxRates.chargingZoneRate;


        // Add timeRate
        totalPrice += timeRate * totalMin;
        // Add fixedRate
        totalPrice += fixedRate;

        // Get the parkinzones
        let noParkingZones = city.zones.filter(x => x.zoneType.includes("noParkingZone"));
        let parkingZones = city.zones.filter(x => x.zoneType.includes("parkingZone"));
        let bonusParkingZones = city.zones.filter(x => x.zoneType.includes("bonusParkingZone"));
        let chargingZones = city.zones.filter(x => x.zoneType.includes("chargingZone"));

        // Check if user start or end in No Parking zone
        for (noParkingZone in noParkingZones) {
            if(classifyPoint(noParkingZones[noParkingZone].coordinates, arrayStartPosition) == -1) { // If user started the scooter trip on a no parking zone
                startInNoParkinZone = true;
            }
            if (classifyPoint(noParkingZones[noParkingZone].coordinates, arrayEndPosition) == -1) { // If user ended the scooter trip on a no parking zone
                endInNoParkinZone = true;
            }
        }

        // Check if user start or end in Bonus Parking zone
        for (bonusParkingZone in bonusParkingZones) {
            if(classifyPoint(bonusParkingZones[bonusParkingZone].coordinates, arrayStartPosition) == -1) { // If user started the scooter trip on a bonus parking zone
                startInBonusParkinZone = true;
            }
            if (classifyPoint(bonusParkingZones[bonusParkingZone].coordinates, arrayEndPosition) == -1) { // If user ended the scooter trip on a bonus parking zone
                endInBonusParkinZone = true;
            }
        }

        // Check if user start or end in charging zone
        for (chargingZone in chargingZones) {
            if(classifyPoint(chargingZones[chargingZone].coordinates, arrayStartPosition) == -1) { // If user started the scooter trip on a charging zone
                startInChargingZone = true;
            }
            if (classifyPoint(chargingZones[chargingZone].coordinates, arrayEndPosition) == -1) { // If user ended the scooter trip on a charging zone
                endInChargingZone = true;
            }
        }

        // Check if user start or end in Parking zone)
        for (parkingZone in parkingZones) {
            if(classifyPoint(parkingZones[parkingZone].coordinates, arrayStartPosition) == -1) { // If user started the scooter trip on a parking zone
                startInParkinZone = true;
            }
            if (classifyPoint(parkingZones[parkingZone].coordinates, arrayEndPosition) == -1) { // If user ended the scooter trip on a parking zone
                endInParkinZone = true;
            }
        }
        
        // Check if user take a sccoter from a no parkin zone and parks it at at valid zone
        // Reducts the price with noParkingToValidParking rate.
        if(startInNoParkinZone && endInParkinZone && !endInNoParkinZone 
            || startInNoParkinZone && endInBonusParkinZone && !endInNoParkinZone
            || startInNoParkinZone && endInChargingZone && !endInNoParkinZone) {
            totalPrice += noParkingToValidParking;
        }
        
        // Check where the user end the trip and reducts / add price rate.
        if (endInNoParkinZone) {
            totalPrice += noParkingZoneRate;
        } else if (endInBonusParkinZone) {
            totalPrice += bonusParkingZoneRate;
        } else if (endInChargingZone) {
            totalPrice += chargingZoneRate;
        } else if (endInParkinZone) {
            totalPrice += parkingZoneRate;
        }

        // Return totalPrice with 2 decimals and total min in a array
        return [totalPrice.toFixed(2), `${totalMin}:${totalSeconds}`];
    },

    // Stop a scooter
    stopScooter: async function(res, scooter_id, user_id, path) {
        let timeToday = new Date();
        let scooterId = sanitize(scooter_id);
        let userId = sanitize(user_id);
        let endTime = timeToday.getHours() + ":" + timeToday.getMinutes() + ":" + timeToday.getSeconds();

        // Check if the ids are valid MongoDB ids.
        if (!ObjectId.isValid(scooterId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The scooter_id is not a valid id."
                }
            });
        } else if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "The user_id is not a valid id."
                }
            });
        };

        // Check if the scooter is valid and then get the data.
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooters_collection = db.collection("scooters");
            var scooter = await scooters_collection.findOne({_id: ObjectId(scooterId)});

            // If scooter not in db collection
            if (scooter === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "POST /scooters" + path,
                        title: "Scooter not exists in database",
                        detail: "The scooter dosen't exists in database with the specified scooter_id."
                    }
                });
            }

            // If scooter is already in use
            if (scooter.status !== "In use" || scooter.trip.userId !== userId) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "POST /scooters" + path,
                        title: "Not rented by user",
                        detail: "The specified scooter are not rented by user."
                    }
                });
            }

            // Stop the scooter and set the status to Available and trip endtime to the stop time
            await scooters_collection.updateOne({_id: ObjectId(scooterId)}, {$set: {status: "Available", "trip.endTime": endTime} });
        } catch(e) { return res.status(500).send(); } finally { await client.close(); }

        let userClient = new MongoClient(mongoURI);
        try {
            let db = userClient.db("spark-rentals");
            let user_collection = db.collection("users");
            var user = await user_collection.findOne({_id: ObjectId(userId)});

            // Check If nothing in db collection
            if (user === null) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "POST /scooters" + path,
                        title: "User not exists in database",
                        detail: "The User dosen't exists in database with the specified user_id."
                    }
                });
            }

            let arrayCalculate = await scooters.calculateRidePrice(res, scooter, endTime); // Get price and time
            let totalPrice = arrayCalculate[0];
            let totalMin = arrayCalculate[1];


            // Add all the data to the history field
            let historyDataField = {
                _id: new ObjectId(),
                scooterName: scooter.name,
                scooterId: scooterId,
                date: scooter.trip.date,
                startPosition: scooter.trip.startPosition,
                endPosition: scooter.coordinates,
                totalMin: totalMin,
                totalPrice: totalPrice,
                distance: scooter.trip.distance
            }

            let newBalance = user.balance - parseFloat(totalPrice);

            // Push the history data to user history
            await user_collection.updateOne({_id: ObjectId(userId)}, {$push: {history: historyDataField} });
            await user_collection.updateOne({_id: ObjectId(userId)}, {$set: {balance: newBalance} });
        } catch(e) { return res.status(500).send(); } finally { await userClient.close(); }

        return res.status(200).send(); // Everything went good
    }
}

module.exports = scooters;
// Data Generator for scooters collection
var hat = require('hat');
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";

const scooters = {
    generateScooters: async function() {
        let scooterdata1 = {
            //_id will be added when pushed to db
            status: "Available",
            battery: 100,
            speed: 0,
            owner: "Stockholm",
            position: {
                longitude: "5.0",
                latitude: "1.0"
            },
            currentTrip: {
                startPosition: {
                    longitude: "5.0",
                    latitude: "1.0"
                },
                startTime: 0,
                endTime: 0
            }
        };
    
        let scooterdata2 = {
            //_id will be added when pushed to db
            status: "Not available",
            battery: 54,
            speed: 0,
            owner: "Karlskrona",
            position: {
                longitude: "2.0",
                latitude: "15.0"
            },
            currentTrip: {
                startPosition: {
                    longitude: "2.0",
                    latitude: "15.0"
                },
                startTime: 0,
                endTime: 0
            }
        };
    
        let scooterdata3 = {
            //_id will be added when pushed to db
            status: "In use",
            battery: 42,
            speed: 43,
            owner: "Halmstad",
            position: {
                longitude: "22.0",
                latitude: "145.0"
            },
            currentTrip: {
                startPosition: {
                    longitude: "22.0",
                    latitude: "145.0"
                },
                startTime: 23,
                endTime: 0
            }
        };
    
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooter_collection = db.collection("scooters");
            await scooter_collection.insertMany([scooterdata1, scooterdata2, scooterdata3]);
        } catch(e) {
            console.log(e);
        } finally {
            await client.close();
        }
    }
}

module.exports = scooters;
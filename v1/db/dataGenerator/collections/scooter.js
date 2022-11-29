// Data Generator for scooters collection
var hat = require('hat');
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";
var today = new Date();

const scooters = {
    generateScooters: async function() {
        let stock1 = {
            //_id will be added when pushed to db
            owner: "Stockholm",
            coordinates: {
                longitude: "18.121465",
                latitude: "59.315499"
            },
            trip: {
                userID: "6384ce8439f427e20d14ab68",
                startPosition: {
                    longitude: "18.121465",
                    latitude: "59.315499"
                },
                startTime: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
                endTime: null
            },
            battery: 42,
            status: "In use",
            log: {}
        };

        let stock2 = {
            //_id will be added when pushed to db
            owner: "Stockholm",
            coordinates: {
                longitude: "18.066288",
                latitude: "59.312761"
            },
            trip: {
                userID: "6384c3492eb2414c10ecc71d",
                startPosition: {
                    longitude: "18.066288",
                    latitude: "59.312761"
                },
                startTime: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
                endTime: null
            },
            battery: 100,
            status: "In use",
            log: {}
        };

        let stock3 = {
            //_id will be added when pushed to db
            owner: "Stockholm",
            coordinates: {
                longitude: "18.019565",
                latitude: "59.335181"
            },
            trip: {},
            battery: 87,
            status: "Available",
            log: {}
        };
    
        let karl1 = {
            //_id will be added when pushed to db
            owner: "Karlskrona",
            coordinates: {
                longitude: "15.584684",
                latitude: "56.159398"
            },
            trip: {},
            battery: 22,
            status: "Maintenance",
            log: {}
        };
    
        let karl2 = {
            //_id will be added when pushed to db
            owner: "Karlskrona",
            coordinates: {
                longitude: "15.583654",
                latitude: "56.156913"
            },
            trip: {},
            battery: 100,
            status: "Unavailable",
            log: {}
        };

        let karl3 = {
            //_id will be added when pushed to db
            owner: "Karlskrona",
            coordinates: {
                longitude: "15.567507",
                latitude: "56.163796"
            },
            trip: {},
            battery: 72,
            status: "Available",
            log: {}
        };

        let karl4 = {
            //_id will be added when pushed to db
            owner: "Karlskrona",
            coordinates: {
                longitude: "15.607015",
                latitude: "56.181379"
            },
            trip: {},
            battery: 98,
            status: "Available",
            log: {}
        };

        let karl5 = {
            //_id will be added when pushed to db
            owner: "Karlskrona",
            coordinates: {
                longitude: "15.619727",
                latitude: "56.183863"
            },
            trip: {},
            battery: 4,
            status: "Off",
            log: {}
        };

        let karl6 = {
            //_id will be added when pushed to db
            owner: "Karlskrona",
            coordinates: {
                longitude: "15.601862",
                latitude: "56.176793"
            },
            trip: {
                userID: "6384c2f8fdda8c74df8084bc",
                startPosition: {
                    longitude: "15.601862",
                    latitude: "56.176793"
                },
                startTime: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
                endTime: null
            },
            battery: 68,
            status: "In use",
            log: {}
        };

        let halm1 = {
            //_id will be added when pushed to db
            owner: "Halmstad",
            coordinates: {
                longitude: "12.826067",
                latitude: "56.673852"
            },
            trip: {},
            battery: 42,
            status: "Maintenance",
            log: {}
        };

        let halm2 = {
            //_id will be added when pushed to db
            owner: "Halmstad",
            coordinates: {
                longitude: "12.880004",
                latitude: "56.680265"
            },
            trip: {},
            battery: 42,
            status: "Available",
            log: {}
        };

        let halm3 = {
            //_id will be added when pushed to db
            owner: "Halmstad",
            coordinates: {
                longitude: "12.920887",
                latitude: "56.673475"
            },
            trip: {
                userID: "6384c2f8fdda8c74df8084bc",
                startPosition: {
                    longitude: "12.920887",
                    latitude: "56.673475"
                },
                startTime: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
                endTime: null
            },
            battery: 42,
            status: "In use",
            log: {}
        };
    
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let scooter_collection = db.collection("scooters");
            await scooter_collection.insertMany([stock1, stock2, stock3, karl1, karl2, karl3, karl4, karl5, karl6, halm1, halm2, halm3]);
        } catch(e) {
            console.log(e);
        } finally {
            await client.close();
        }
    }
}

module.exports = scooters;
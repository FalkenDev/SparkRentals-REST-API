// Data Generator for cities collection
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";

const cities = {
    generateCities: async function() {
        let citydata1 = {
            //_id will be added when pushed to db
            name: "Stockholm",
            taxRates: {
                fixedRate: 15,
                timeRate: 5,
                bonusParkingZoneRate: 15,
                parkingZoneRate: 5,
                noParkingZoneRate: 100
            }
        };

        let citydata2 = {
            //_id will be added when pushed to db
            name: "Karlskrona",
            taxRates: {
                fixedRate: 20,
                timeRate: 2.5,
                bonusParkingZoneRate: 5,
                parkingZoneRate: 10,
                noParkingZoneRate: 100
            }
        };

        let citydata3 = {
            //_id will be added when pushed to db
            name: "Halmstad",
            taxRates: {
                fixedRate: 15,
                timeRate: 2,
                bonusParkingZoneRate: 3,
                parkingZoneRate: 9,
                noParkingZoneRate: 100
            }
        };

        let zonedata1 = {
            _id: new ObjectId(),
            zoneType: "bonusParkingZoneRate",
            longitude: "20",
            latitude: "30",
            radius: "22",
        }

        let zonedata2 = {
            _id: new ObjectId(),
            zoneType: "noParkingZoneRate",
            longitude: "233",
            latitude: "15",
            radius: "4",
        }

        let zonedata3 = {
            _id: new ObjectId(),
            zoneType: "parkingZoneRate",
            longitude: "433",
            latitude: "642",
            radius: "30",
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let cities_collection = db.collection("cities");
            await cities_collection.insertMany([citydata1, citydata2, citydata3]);

            let city1 = await cities_collection.findOne({name: "Stockholm"});
            let city1id = city1._id.toString()
            await cities_collection.updateOne({_id: ObjectId(city1id)}, {$push: {"zones": {$each: [zonedata1, zonedata2, zonedata3]} } });

            let city2 = await cities_collection.findOne({name: "Karlskrona"});
            let city2id = city2._id.toString()
            await cities_collection.updateOne({_id: ObjectId(city2id)}, {$push: {"zones": {$each: [zonedata1, zonedata2, zonedata3]} } });

            let city3 = await cities_collection.findOne({name: "Halmstad"});
            let city3id = city3._id.toString()
            await cities_collection.updateOne({_id: ObjectId(city3id)}, {$push: {"zones": {$each: [zonedata1, zonedata2, zonedata3]} } });

            /*let city4 = await cities_collection.findOne({name: "Halmstad"});
            let city4id = city4._id.toString()
            cities_collection.updateOne({_id: ObjectId(city4id)}, {$push: {"zones": {$each: [zonedata1, zonedata2, zonedata3]} } });*/
        
        } catch(e) {
            console.log(e);
        } finally {
            await client.close();
        }

        /*let client2 = new MongoClient(mongoURI);
        try {
            let db = client2.db("spark-rentals");
            let cities_collection = db.collection("cities");

            let city1 = await cities_collection.findOne({name: "Stockholm"})
            let city1id = city1._id.toString()
            cities_collection.updateMany({_id: ObjectId(city1id)}, {$push: {"zones": {$each: [zonedata1, zonedata2, zonedata3]} } });

            let city2 = await cities_collection.findOne({name: "Karlskrona"})
            let city2id = city2._id.toString()
            cities_collection.updateMany({_id: ObjectId(city2id)}, {$push: {"zones": {$each: [zonedata1, zonedata2, zonedata3]} } });

            let city3 = await cities_collection.findOne({name: "Halmstad"})
            let city3id = city3._id.toString()
            cities_collection.updateMany({_id: ObjectId(city3id)}, {$push: {"zones": {$each: [zonedata1, zonedata2, zonedata3]} } });
        
        } catch(e) {
            console.log(e);
        } finally {
            await client2.close();
        }*/
    }
}

module.exports = cities;
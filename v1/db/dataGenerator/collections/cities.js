// Data Generator for cities collection
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = process.env.DBURI;

const cities = {
    generateCities: async function() {
        let citydata1 = {
            //_id will be added when pushed to db
            name: "Stockholm",
            taxRates: {
                fixedRate: 15,
                timeRate: 5,
                bonusParkingZoneRate: -15,
                parkingZoneRate: 5,
                noParkingZoneRate: 100,
                noParkingToValidParking: -25,
                chargingZoneRate: -20
            },
            zones: []
        };

        let citydata2 = {
            //_id will be added when pushed to db
            name: "Karlskrona",
            taxRates: {
                fixedRate: 20,
                timeRate: 2.5,
                bonusParkingZoneRate: -5,
                parkingZoneRate: 10,
                noParkingZoneRate: 100,
                noParkingToValidParking: -25,
                chargingZoneRate: -20
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
                noParkingZoneRate: 100,
                noParkingToValidParking: -25,
                chargingZoneRate: -20
            },
            zones: []
        };

        let karlZoneData1 = {
            _id: new ObjectId(),
            zoneType: "parkingZone",
            type: "MultiPolygon",
            coordinates : [
                [15.586903436602825, 56.170099316232324],
                [15.58372557772492, 56.16870746202363],
                [15.591939, 56.16443136504452],
                [15.580582916875812, 56.192853],
                [15.581276711274256, 56.1630031849856],
                [15.58083492201942, 56.162325567780044],
                [15.578746297969872, 56.16243429698295],
                [15.578760202581861, 56.16268065156265],
                [15.574978231798184,56.16311655440697],
                [15.573690010819092,56.16362717907964],
                [15.570960853874709,56.16403722774348],
                [15.571116648494439,56.16344050404706],
                [15.57144115206458,56.16315653715361],
                [15.570610508518143,56.161524640329816],
                [15.571422621075868,56.16142755870885],
                [15.571340232863804,56.1608192568782],
                [15.573658873138669,56.160551764874725],
                [15.576707237784433,56.16065130652245],
                [15.578366772190435,56.15913849137854],
                [15.578540672540385,56.15741679635667],
                [15.580459141391827,56.157227937849484],
                [15.58038609495361,56.155734919286914],
                [15.592756099668549,56.155690263232486],
                [15.59286608493241,56.158590737705936],
                [15.593878283221585,56.1586587408392],
                [15.594856540380022,56.15973516910012],
                [15.595480337011253,56.1614601482718],
                [15.596975094958879,56.162726285290205],
                [15.592292824857083,56.16738380616556],
                [15.586925820439177,56.16739936939092],
                [15.588114666697265,56.169757673828656]
            ],
        }

        let karlZoneData2 = {
            _id: new ObjectId(),
            zoneType: "chargingZone",
            type: "MultiPolygon",
            coordinates : [
                [15.586683065618786,56.164952347740524],
                [15.586613104746192,56.163035438695374],
                [15.584962220461762,56.16309170217792],
                [15.58506572135991,56.16502307811223]
            ],
        }

        let karlZoneData3 = {
            _id: new ObjectId(),
            zoneType: "noParkingZone",
            type: "MultiPolygon",
            coordinates : [
                [15.591729674047599,56.163578344295104],
                [15.591683495653257,56.16389568178252],
                [15.593359687881247,56.16386848384377],
                [15.59328793246749,56.163432386829015]
            ],
        }

        let karlZoneData4 = {
            _id: new ObjectId(),
            zoneType: "bonusParkingZone",
            type: "MultiPolygon",
            coordinates : [
                [15.58688693857394,56.162185657967484],
                [15.58686654736266,56.162053287205026],
                [15.58857135904924,56.162022881552474],
                [15.588600604385306,56.16214894928092]
            ],
        }

        let karlZoneData5 = {
            _id: new ObjectId(),
            zoneType: "noParkingZone",
            type: "MultiPolygon",
            coordinates : [
                [15.585533309935869,56.159747036257784],
                [15.585610716494045,56.15919368960442],
                [15.585302255599373,56.15757089771603],
                [15.585316027571423,56.15724644827168],
                [15.58653814712332,56.157166071143024],
                [15.587211343871644,56.15860111834854],
                [15.587456977663635,56.159679451168415]
            ],
        }

        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let cities_collection = db.collection("cities");
            await cities_collection.insertMany([citydata1, citydata2, citydata3]);

            let city2 = await cities_collection.findOne({name: "Karlskrona"});
            let city2id = city2._id.toString()
            await cities_collection.updateOne({_id: ObjectId(city2id)}, {$push: {"zones": {$each: [karlZoneData1, karlZoneData2, karlZoneData3, karlZoneData4, karlZoneData5]} } });

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
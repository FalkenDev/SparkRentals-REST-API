// Data Generator for Prepaid collection
var hat = require('hat');
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";

const prepaids = {
    generatePrepaids: async function() {
        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let prepaid_collection = db.collection("prepaid");

            let data = {
                code: "637b8c597e2acbb3430f3b59",
                users: [],
                uses: (Math.floor(Math.random() * (100 - 1 + 1)) + 1),
                amount: (Math.floor(Math.random() * (500 - 10 + 1)) + 10)
            }
            await prepaid_collection.insertOne(data);

            for (let i = 0; i < 40; i++) {
                let data = {
                    code: hat(),
                    users: [],
                    uses: (Math.floor(Math.random() * (100 - 1 + 1)) + 1),
                    amount: (Math.floor(Math.random() * (500 - 10 + 1)) + 10)
                }
                await prepaid_collection.insertOne(data);
            }

        } catch(e) {
            console.log(e);
        } finally {
            await client.close();
        }
    }
}

module.exports = prepaids;
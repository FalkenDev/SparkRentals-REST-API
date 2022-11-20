const express = require('express');
const path = require("path");
const router = express.Router();

// MongoDb Database
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";


router.get('/', function(req, res){
    console.log("Worker: " + process.pid)
    res.sendFile(path.join(__dirname + '/documentation.html'));
})

/*router.get('/test', async function(req, res){
    let client = new MongoClient(mongoURI);
    console.log("Worker: " + process.pid)

    try {
        let db = client.db("spark-rentals");
        let collection = db.collection("test1337");
        const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
        console.log('Inserted documents =>', insertResult);
        const findResult = await collection.find({}).toArray();
        console.log('Found documents =>', findResult);
        res.send(findResult)
    } catch(error) {
        console.log(error);
    } finally {
        await client.close();
    }
})*/


router.use(function (req, res) {
    return res.status(404).json({
        errors: {
            status: 404,
            source: req.path,
            title: "Not found",
            detail: "Could not find path: " + req.path,
        }
    });
});

module.exports = router;

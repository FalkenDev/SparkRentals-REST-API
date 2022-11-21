// Data generator for admins collection
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";

const admins = {
    createCryptPass: async function(password) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt)
        return hash;
    },

    generateAdmins: async function() {
        let pass1 = await admins.createCryptPass("admin1");
        let pass2 = await admins.createCryptPass("admin2");

        let admin1 = {
            firstName: "Samuel",
            lastname: "Freden",
            email: "samuel.freden@gmail.com",
            password: pass1,
        }

        let admin2 = {
            firstName: "Zacke",
            lastname: "Lurgren",
            email: "zacke.lurgren@gmail.com",
            password: pass2,
        }


        let client = new MongoClient(mongoURI);
        try {
            let db = client.db("spark-rentals");
            let admins_collection = db.collection("admins");
            await admins_collection.insertMany([admin1, admin2]);
        } catch(e) {
            console.log(e);
        } finally {
            await client.close();
        }
    }
}

module.exports = admins;
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const Users = require("../models/users");
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = process.env.DBURI;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
}, async(req, accessToken, refreshToken, profile, cb) => {
    const defaultUser = {
        firstName: `${profile.name.givenName}`,
        lastName: `${profile.name.familyName}`,
        email: profile.emails[0].value,
        googleId: profile.id,
    }

    let user = null
    let client = new MongoClient(mongoURI);
    try {
        let db = client.db("spark-rentals");
        let users_collection = db.collection("users");
<<<<<<< HEAD
        user = await users_collection.findOne({email: profile.emails[0].value});
        if (user == null || user.length == 0) {
            await users_collection.insertOne(defaultUser);
            user = await users_collection.findOne({googleId: profile.id});
        } else if (user.googleId == null) {

=======
        user = await users_collection.findOne({googleId: profile.id});
        if (user == null || user.length == 0) {
            await users_collection.insertOne(defaultUser);
            user = await users_collection.findOne({googleId: profile.id});
>>>>>>> 9bcc04b2c6f371f7a56ca22bde37388f668036d3
        }
    } catch(err) { console.log(err); return cb(err, null); } finally { await client.close(); }

    if (user) return cb(null, user);
}));

passport.serializeUser((user, cb) => {
    console.log("Serializing user", user);
    console.log("-------------------------------USER ID:",user._id);
    cb(null, user._id);
});

passport.deserializeUser(async (id, cb) => {
    console.log("-------------------------------USER2 ID:",id);
    let user = null;
    let client = new MongoClient(mongoURI);
    try {
        let db = client.db("spark-rentals");
        let users_collection = db.collection("users");
        user = await users_collection.findOne({_id: ObjectId(id)});
    } catch(err) { console.log("ERROR De-Serializing user", err); return cb(err, null); } finally { await client.close(); }
    console.log("De-Serializing user", user);

    if (user) cb(null, user);
});
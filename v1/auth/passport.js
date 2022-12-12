const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const Users = require("../models/users");
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = process.env.DBURI;
const google_callback_url = "http://sparkrentals.software:8393/v1/auth/google/callback"

console.log("-----------------------")
console.log(process.env.GOOGLE_CLIENT_ID,)

console.log(process.env.GOOGLE_CLIENT_SECRET)

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: google_callback_url,
    passReqToCallback: true
}, async(req, accessToken, refreshToken, profile, cb) => {
    const defaultUser = {
        firstName: `${profile.name.givenName}`,
        lastName: `${profile.name.familyName}`,
        email: profile.emails[0].value,
        googleId: profile.id,
    }

    console.log("---------------------")
    console.log(defaultUser)
    console.log("--Access-------------")
    console.log(accessToken)
    console.log("--refreshToken-------------")
    console.log(refreshToken)
    console.log("---------------------")

    let user = null
    let client = new MongoClient(mongoURI);
    try {
        let db = client.db("spark-rentals");
        let users_collection = db.collection("users");
        user = await users_collection.findOne({googleId: profile.id});
        if (user == null || user.length == 0) {
            await users_collection.insertOne(defaultUser);
        }
        return cb(null, user);
    } catch(e) { console.log(e); return res.status(500).send(); } finally { await client.close(); }
}));

passport.serializeUser((user, cb) => {
    console.log("-------------Serializing--------------------")
    console.log("Serializing user", user);
    cb(null, user.googleId);
});

passport.deserializeUser(async (id, cb) => {
    console.log("-------------DeSerializing--------------------")
    let user = null;
    let client = new MongoClient(mongoURI);
    try {
        let db = client.db("spark-rentals");
        let users_collection = db.collection("users");
        user = await users_collection.findOne({googleId: id});
    } catch(e) { console.log(e); return res.status(500).send(); } finally { await client.close(); }
    console.log("DeSerializing user", user);

    if (user) cb(null, user);
});
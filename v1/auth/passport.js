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
        user = await users_collection.findOne({googleId: profile.id});
        if (user == null || user.length == 0) {
            await users_collection.insertOne(defaultUser);
            user = await users_collection.findOne({googleId: profile.id});
        }
    } catch(err) { console.log(err); return cb(err, null); } finally { await client.close(); }

    if (user) return cb(null, user);
}));

passport.serializeUser((user, cb) => {
    console.log("Serializing user", user);
    cb(null, user.googleId);
});

passport.deserializeUser(async (id, cb) => {
    let user = null;
    let client = new MongoClient(mongoURI);
    try {
        let db = client.db("spark-rentals");
        let users_collection = db.collection("users");
        user = await users_collection.findOne({googleId: id});
    } catch(err) { console.log("ERROR De-Serializing user", err); return cb(err, null); } finally { await client.close(); }
    console.log("De-Serializing user", user);

    if (user) cb(null, user);
});
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
        googleId: profile.id,
        firstName: `${profile.name.givenName}`,
        lastName: `${profile.name.familyName}`,
        phoneNumber: null,
        email: profile.emails[0].value,
        password: null,
        balance: 0,
        history: [],
        accessToken: accessToken,
    }

    let user = null
    let client = new MongoClient(mongoURI);
    try {
        let db = client.db("spark-rentals");
        let users_collection = db.collection("users");
        user = await users_collection.findOne({email: profile.emails[0].value});
        if (user == null || user.length == 0) {
            await users_collection.insertOne(defaultUser);
            user = await users_collection.findOne({googleId: profile.id});
        } else if (user.googleId == null) {
            await users_collection.updateOne({email: profile.emails[0].value}, {$set: {googleId: profile.id, accessToken: accessToken} });
            user = await users_collection.findOne({googleId: profile.id});
        } else {
            await users_collection.updateOne({googleId: profile.id}, {$set: {accessToken: accessToken}});
        }
    } catch(err) { return cb(err, null); } finally { await client.close(); }

    if (user){
        return cb(null, user); 
    }
}));

passport.serializeUser((user, cb) => {
    cb(null, user._id);
});

passport.deserializeUser(async (id, cb) => {
    let user = null;
    let client = new MongoClient(mongoURI);
    try {
        let db = client.db("spark-rentals");
        let users_collection = db.collection("users");
        user = await users_collection.findOne({_id: ObjectId(id)});
    } catch(err) { return cb(err, null); } finally { await client.close(); }

    if (user) cb(null, user);
});

const GoogleOauthTokenStrategy = require('passport-google-oauth-token');

passport.use(new GoogleOauthTokenStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
}, async(accessToken, refreshToken, profile, cb) => {
    let user = null
    let client = new MongoClient(mongoURI);
    try {
        let db = client.db("spark-rentals");
        let users_collection = db.collection("users");
        user = await users_collection.findOne({email: profile.emails[0].value});
        if (user == null || user.length == 0) {
            await users_collection.insertOne(defaultUser);
            user = await users_collection.findOne({googleId: profile.id});
        } else if (user.googleId == null) {
            await users_collection.updateOne({email: profile.emails[0].value}, {$set: {googleId: profile.id, accessToken: accessToken} });
            user = await users_collection.findOne({googleId: profile.id});
        }
    } catch(err) { return cb(err, null); } finally { await client.close(); }
    return cb(null, user); 
}));
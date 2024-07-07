const passport = require('passport');
const dotenv = require("dotenv");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
dotenv.config();

const callbackURL =
    process.env.NODE_ENV === 'production'
        ? "https://formatconvertorbackend-shashank-pants-projects.vercel.app/auth/google/callback"
        : "http://localhost:5000/auth/google/callback";

console.log(process.env.GOOGLE_CLIENT_ID, " ", process.env.GOOGLE_CLIENT_SECRET);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                // If the user is not found, create a new one
                user = new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value // assuming the user has a single email
                });
                await user.save();
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    try {
        const user = await User.findById(id);
        done(null, user); // Pass the found user to done callback
    } catch (err) {
        done(err); // Pass any error to done callback
    }
});

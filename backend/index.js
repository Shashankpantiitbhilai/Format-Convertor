const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileRoutes = require('./routes/fileroutes');
const path = require('path');
const dotenv = require("dotenv");
const session = require('express-session');
const passport = require('passport');
require('./auth/passportConfig'); // Import the Passport.js configuration
const { connectDB } = require("./db");
dotenv.config();

const app = express();
const PORT = 5000;
connectDB();

const origin = process.env.NODE_ENV === "production"
    ? "https://edugainers-format-test.vercel.app"
    : "http://localhost:3000";

app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
    origin,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.options('*', cors());

// Connect to MongoDB
connectDB();

// Body parser middleware
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Session configuration
if (process.env.NODE_ENV === 'development') {
    app.use(session({
        secret: 'keyboard cat', // Use environment variable for session secret
        saveUninitialized: true, // Do not save uninitialized sessions
        resave: false
    }));
} else {
    app.use(session({
        secret: 'keyboard cat', // Use environment variable for session secret
        saveUninitialized: true, // Do not save uninitialized sessions
        resave: false,
        proxy: true,
        cookie: {
            secure: true, // Ensure cookies are only sent over HTTPS
            httpOnly: true, // Cookies are not accessible via JavaScript
            sameSite: 'none' // Allow cross-site cookies
        }
    }));
}

const outputDir = process.env.NODE_ENV === 'development'
    ? path.join('output')
    : '/tmp/output';

app.use('/output', express.static(outputDir));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Use the auth routes
const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);

app.use('/api/files', fileRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

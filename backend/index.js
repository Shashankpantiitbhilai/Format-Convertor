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
connectDB()

const origin = process.env.NODE_ENV === "production"
    ? "https://edugainers-format-test.vercel.app"
    : "http://localhost:3000";


app.use(cors({
    origin,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const outputDir = process.env.NODE_ENV === 'development'
    ? path.join('output')
    : '/tmp/output';

app.use('/output', express.static(outputDir));

// Express session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

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

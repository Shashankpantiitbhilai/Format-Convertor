const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileRoutes = require('./routes/fileroutes');
const path = require('path');
const app = express();
const PORT = 5000;
const dotenv = require("dotenv")
dotenv.config();
const origin =
    process.env.NODE_ENV === "production"
        ? "https://formatconvertor.vercel.app"
        : "http://localhost:3000";
app.use(cors({
    origin,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/output', express.static(path.join(__dirname, 'output')));

app.use('/api/files', fileRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

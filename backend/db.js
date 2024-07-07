const mongoose = require("mongoose");
const dotenv = require("dotenv")
dotenv.config()

const connectDB = async () => {

    try {
        const ConnectDB = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.jkn3buc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/formatConvertor`;
        await mongoose.connect(ConnectDB);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
    }
}
// connectDB()

const closeDB = () => {
    mongoose.connection.close()
        .then(() => {
            console.log('MongoDB connection closed');
        })
        .catch((err) => {
            console.error('Error while closing MongoDB connection:', err);
        });
};

// Call the connectDB function to establish the MongoDB connection


module.exports = { connectDB, closeDB };
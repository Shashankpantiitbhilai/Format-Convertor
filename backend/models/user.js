const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Add other roles as needed
        default: 'user'
    },
    uploadCount: {
        type: Number,
        default: 3
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

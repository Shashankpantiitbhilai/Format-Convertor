const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require("../models/user")
// Route to start the authentication process
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route after successful authentication
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?auth_success=false' }),
    (req, res) => {
        // Successful authentication
        const frontendUrl = process.env.NODE_ENV === "production"
            ? "https://edugainers-format-test.vercel.app"
            : "http://localhost:3000";

        // Prepare user info
        console.log("ncjcnd", req.user)
        const userInfo = {
            id: req.user._id,
            name: req.user.username,
            email: req.user.email,
            // Assuming you have a way to determine the user's role
        };

        // Encode and stringify user info
        const encodedUserInfo = encodeURIComponent(JSON.stringify(userInfo));

        res.redirect(`${frontendUrl}/login?auth_success=true&user_info=${encodedUserInfo}`);
    }
);
// Route to handle logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
router.get("/fetchAuth", function (req, res) {
    // console.log(req.session)
    // console.log("fetch", req.user)
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.json(null);
    }
});
router.post('/updateCount', async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(userId)
        // Find the user by ID and update uploadCount
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log("user is", user)
        user.uploadCount -= 1;
        await user.save();

        res.json({ message: 'Upload count updated successfully', uploadCount: user.uploadCount });
    } catch (error) {
        console.error('Error updating upload count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;

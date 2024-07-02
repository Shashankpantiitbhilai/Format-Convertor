// webpack.config.js
const path = require('path');

module.exports = {
    // Other configurations...

    resolve: {
        fallback: {
            "util": require.resolve("util/"),
            // Add other fallbacks as needed
        }
    },

    // Rest of your Webpack config...
};

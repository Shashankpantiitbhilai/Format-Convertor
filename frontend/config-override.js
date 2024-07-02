const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "util": require.resolve("util/"),
        // Add other fallbacks as needed
    };
    return config;
};

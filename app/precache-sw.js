var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = {
    navigateFallback: '/index.html',
    navigateFallbackWhitelist: [/^(?!\/__)/],
    stripPrefix: 'dist',
    root: 'dist/',
    plugins: [
        new SWPrecacheWebpackPlugin({
            cacheId: 'firestarter',
            filename: 'precache-sw.js',
            staticFileGlobs: [
                'dist/index.html',
                'dist/**.js',
                'dist/**.css',
                'dist/img/**.*',
                'dist/assets/**.*'
            ],
            stripPrefix: 'dist/assets/',
            mergeStaticsConfig: true
        }),
    ],
    runtimeCaching: [
        {
            urlPattern:/^https:\/\/raw\.githubusercontent\.com\/sympozer\/datasets\/master\/WWW2018\/publications\.ttl/,
            handler: 'cacheFirst'
        },
        {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/sympozer\/datasets\/master\/WWW2018\/sessions\.ttl/,
            handler: 'cacheFirst'
        },
    ],
};

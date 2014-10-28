var webpack = require('webpack');

module.exports = function(root) {
    return {
        resolve: {
            alias: {
                "snapsvg": root + "/node_modules/snapsvg/dist/snap.svg.js",
                "scripts": root + "/engine/scripts",
                "engine": root + "/engine",
                "app": root + "/app"
            }
        },
        module: {
            loaders: [
                { test: /\.css$/, loader: "style!css" },
                { test: /\.html$/, loader: "ractive" }                ]
        },
        output: {
            filename: "app.js"
        },
        plugins: [
            //new webpack.optimize.UglifyJsPlugin()
        ]
    };
};
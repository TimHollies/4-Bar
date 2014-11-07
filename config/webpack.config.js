var webpack = require('webpack'),
    root = __dirname+'/..';

module.exports = {
    entry: {
        app: root + "/app/app",
    },
    resolve: {
        alias: {
            "snapsvg": root + "/node_modules/snapsvg/dist/snap.svg.js",
            "scripts": root + "/engine/scripts",
            "engine": root + "/engine",
            "app": root + "/app",
            "vendor": root + "/engine/vendor.js"
        }
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loader: "style!css"
        }, {
            test: /\.html$/,
            loader: "ractive"
        }]
    },
    output: {
        path: root + '/public',
        filename: "[name].js"
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor.js')
    ],
    debug: true,
    devtool: "#inline-source-map",
    watch: true
};
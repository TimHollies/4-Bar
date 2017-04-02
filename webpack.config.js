var path = require("path");
module.exports = {
  entry: {
    app: ["./app/app.jsx"]
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js"
  },
   module: {
    loaders: [
      { test: /\.html$/, loader: 'ractive' },
      {
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['inferno']
        }
      }
    }
    ]
  }
};
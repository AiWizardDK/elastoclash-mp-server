const path = require('path');

module.exports = {
  mode: 'production', // Set mode to 'production' for optimized build
  entry: './js/main.js', // Correct entry point
  output: {
    filename: 'bundle.js', // Output bundled file name
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // If you use Babel for transpilation
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
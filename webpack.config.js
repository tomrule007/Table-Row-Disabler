const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.js',
    tableRowLocker: './src/tableRowLocker.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new CopyPlugin([
      { from: './src/manifest.json' },
      { from: './src/tableRowLocker.css' },
      { from: './src/img', to: 'img' }
    ])
  ]
};

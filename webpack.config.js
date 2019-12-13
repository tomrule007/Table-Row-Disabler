const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.js',
    tableRowDisabler: './src/tableRowDisabler.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new CopyPlugin([
      { from: './src/manifest.json' },
      { from: './src/tableRowDisabler.css' },
      { from: './src/img', to: 'img' }
    ])
  ]
};

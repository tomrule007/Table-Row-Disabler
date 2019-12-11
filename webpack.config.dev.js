const webpackProductionConfig = require('./webpack.config');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');

module.exports = {
  ...webpackProductionConfig,
  mode: 'development', // The plugin is activated only if mode is set to development
  watch: true,
  plugins: [
    new ExtensionReloader({
      manifest: path.resolve(__dirname, './src/manifest.json')
    }),
    new CopyPlugin([
      {
        from: './src/manifest.json',
        transform(content) {
          return JSON.stringify({
            ...JSON.parse(content),
            // EVAL is required for hot reloading
            content_security_policy:
              "script-src 'self' 'unsafe-eval'; object-src 'self'"
          });
        }
      },
      { from: './src/tableRowLocker.css' },
      { from: './src/img', to: 'img' }
    ])
  ]
};

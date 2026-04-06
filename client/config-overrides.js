const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "zlib": false,
    "querystring": false,
    "path": false,
    "crypto": false,
    "fs": false,
    "stream": false,
    "http": false,
    "net": false,
    "url": false,
    "buffer": false,
    "util": false
  };
  
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ];
  
  return config;
};
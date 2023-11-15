const { composePlugins, withNx } = require('@nx/webpack');
const {
  withWatchPolling,
  workaroundDockerDebugSupport,
} = require('../../tools/webpack/config_function');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  withWatchPolling(config);
  workaroundDockerDebugSupport(config);
  return config;
});

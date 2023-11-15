const path = require('path');
const withWatchPolling = (config) => {
  if (process.env.DEV_PLATFORM === 'DOCKER') {
    // Make Hot Module Reload (HMR) works
    // Use polling mechanism to handle Filesystem disparities among diff OS
    config.watchOptions = {
      aggregateTimeout: 500,
      poll: 1000,
    };

    // Handle WebSocket port binding when Docker Host:Container port is different
    config.devServer = {
      ...config.devServer,
      client: {
        webSocketURL: 'auto://0.0.0.0:0/ws',
      },
    };
  }

  return config;
};

const workaroundDockerDebugSupport = (config) => {
  if (process.env.DEV_PLATFORM === 'DOCKER') {
    config.output.devtoolModuleFilenameTemplate = function (info) {
      const rel = path.relative(process.cwd(), info.absoluteResourcePath);
      console.log(`Relative path is ${rel}`);
      return `webpack:///./${rel}`;
    };
  }
  return config;
};
module.exports = { withWatchPolling, workaroundDockerDebugSupport };

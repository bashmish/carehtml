/* eslint-disable no-param-reassign */

const createBaseConfig = require('./karma.conf.js');

module.exports = (config) => {
  config.set(createBaseConfig(config));
  config.files = [
    { pattern: 'bench/**/*.bench.js', type: 'module' },
  ];
  config.frameworks = ['esm', 'source-map-support', 'detectBrowsers', 'benchmark'];
  config.reporters = ['benchmark', 'benchmark-json'];
  config.benchmarkReporter = {
    terminalWidth: 140,
    browserWidth: 50,
    hzWidth: 15,
    showBrowser: true,
  };
  return config;
};

/* eslint-disable no-param-reassign */

const { createDefaultConfig } = require('@open-wc/testing-karma');

module.exports = (config) => {
  config.set(createDefaultConfig(config));
  config.browsers = [];
  config.files = [{ pattern: 'src/**/*.bench.js', type: 'module' }];
  config.frameworks = ['esm', 'detectBrowsers', 'benchmark'];
  config.reporters = ['benchmark', 'benchmark-json'];
  config.esm.nodeResolve = true;
  config.detectBrowsers = {
    usePhantomJS: false,
    preferHeadless: true,
  };
  config.benchmarkReporter = {
    terminalWidth: 140,
    browserWidth: 50,
    hzWidth: 15,
    showBrowser: true,
  };
  return config;
};

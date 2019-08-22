/* eslint-disable no-param-reassign */

const createBaseConfig = require('./karma.conf.js');

module.exports = (config) => {
  config.set(createBaseConfig(config));
  config.browserStack = {
    username: process.env.BROWSERSTACK_USERNAME,
    accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
    project: 'carehtml',
  };
  config.frameworks = [...config.frameworks, 'browserStackBrowserslistLaunchers'];
  config.detectBrowsers.enabled = false;
  return config;
};

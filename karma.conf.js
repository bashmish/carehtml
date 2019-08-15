/* eslint-disable no-param-reassign */

const { createDefaultConfig } = require('@open-wc/testing-karma');

module.exports = (config) => {
  config.set(createDefaultConfig(config));
  config.browsers = [
    'ChromeHeadless',
    'FirefoxHeadless',
    'Safari',
  ];
  config.files = [
    // can be overwritten by passing a --grep flag. examples:
    //
    // npm run test -- --grep test/foo/bar.test.js
    // npm run test -- --grep test/bar/*
    { pattern: config.grep ? config.grep : 'test/**/*.spec.js', type: 'module' },
  ];
  config.esm.nodeResolve = true;
  return config;
};

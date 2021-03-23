/* eslint-disable no-param-reassign */

const { createDefaultConfig } = require('@open-wc/testing-karma');

module.exports = (config) => {
  config.set(createDefaultConfig(config));
  config.browsers = [];
  config.files = [
    // can be overwritten by passing a --grep flag. examples:
    //
    // yarn test -- --grep test/foo/bar.test.js
    // yarn test -- --grep test/bar/*
    { pattern: config.grep ? config.grep : 'test/**/*.spec.js', type: 'module' },
  ];
  config.frameworks = [...config.frameworks, 'detectBrowsers'];
  config.esm.nodeResolve = true;
  config.detectBrowsers = {
    usePhantomJS: false,
    preferHeadless: true,
  };
  return config;
};

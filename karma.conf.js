/* eslint-disable no-param-reassign */

const { createDefaultConfig } = require('@open-wc/testing-karma');

module.exports = (config) => {
  config.set(createDefaultConfig(config));
  config.browsers = [];
  config.files = [
    // can be overwritten by passing a --grep flag. examples:
    //
    // yarn test -- --grep src/foo/bar.spec.js
    // yarn test -- --grep src/bar/*.spec.js
    { pattern: config.grep ? config.grep : 'src/**/*.spec.js', type: 'module' },
  ];
  config.frameworks = [...config.frameworks, 'detectBrowsers'];
  config.esm.nodeResolve = true;
  config.detectBrowsers = {
    usePhantomJS: false,
    preferHeadless: true,
  };
  return config;
};

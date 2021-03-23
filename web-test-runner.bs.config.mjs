import { legacyPlugin } from '@web/dev-server-legacy';
import { browserstackLauncher } from '@web/test-runner-browserstack';
import browserslist from 'browserslist';
import browserslistBrowserstack from 'browserslist-browserstack';
import config from './web-test-runner.config.mjs';

const getCapabilities = browserslistBrowserstack.default;

function filterUniqueCapabilities(capabilities) {
  return capabilities.filter((c) => (
    c === capabilities.find((c2) => (
      c2.browser === c.browser && c2.browser_version === c.browser_version
    ))
  ));
}

const allCapabilities = await getCapabilities({
  username: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  browserslist: { queries: browserslist() },
  formatForSelenium: true,
});

const uniqueCapabilities = filterUniqueCapabilities(allCapabilities);

const browsers = uniqueCapabilities.map(capability => {
  return browserstackLauncher({
    capabilities: {
      'browserstack.user': process.env.BROWSERSTACK_USERNAME,
      'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
      project: 'carehtml',
      name: 'specs',
      build: `carehtml local run at ${Date.now()}`,
      ...capability,
    }
  });
});

export default {
  ...config,
  concurrentBrowsers: 5,
  browsers,
  plugins: [
    legacyPlugin(),
  ],
};

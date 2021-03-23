import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: 'src/**/*.spec.js',
  coverage: true,
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
};

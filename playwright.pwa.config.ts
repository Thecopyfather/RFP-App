import { defineConfig } from '@playwright/test';
import browserConfig from './playwright.config';

/** Run only after npm run build; the development server never proves offline caching. */
export default defineConfig({
  ...browserConfig,
  testIgnore: [],
  testMatch: '**/*.pwa.spec.ts',
  timeout: 60_000,
  use: {
    ...browserConfig.use,
    baseURL: 'http://127.0.0.1:4173',
    serviceWorkers: 'allow',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

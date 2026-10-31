import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: 'gallery-capture.spec.ts',
  testIgnore: [],
  outputDir: './test-results/audit',
});

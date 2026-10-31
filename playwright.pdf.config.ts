import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: 'pdf-viewer.spec.ts',
  testIgnore: [],
  outputDir: './test-results/pdf',
});

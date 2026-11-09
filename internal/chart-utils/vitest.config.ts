import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { name: '@revolist/chart-utils', ...(process.env.CI ? { maxWorkers: process.env.REVOGRID_UNIT_TEST_WORKERS === '2' ? 2 : 1 } : {}), include: ['src/**/*.test.{ts,tsx}'] } });

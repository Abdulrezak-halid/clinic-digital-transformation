import { defineConfig } from '@playwright/test';
const database=process.env.TEST_DATABASE_URL;
if(!database||!new URL(database).pathname.endsWith('_test'))throw new Error('E2E requires isolated TEST_DATABASE_URL ending in _test');
export default defineConfig({testDir:'tests',workers:1,fullyParallel:false,globalSetup:'./tests/setup.ts',use:{baseURL:'http://127.0.0.1:5173',trace:'retain-on-failure',launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}},webServer:{command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:false,timeout:60000,env:{DATABASE_URL:database,MFA_ENCRYPTION_KEY:'a'.repeat(64),APP_ORIGIN:'http://127.0.0.1:5173'}},reporter:'list'});

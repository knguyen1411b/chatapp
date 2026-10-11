import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './testing/e2e',
    timeout: 30000,
    expect: {
        timeout: 10000
    },
    fullyParallel: false,
    workers: 1,
    reporter: [['list']],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],
    webServer: [
        {
            command: 'pnpm --filter ./server run start',
            url: 'http://localhost:5000/api/health',
            reuseExistingServer: true,
            timeout: 30000
        },
        {
            command: 'pnpm --filter ./client run start',
            url: 'http://localhost:3000/login',
            reuseExistingServer: true,
            timeout: 30000
        }
    ]
})

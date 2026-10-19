import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.CI ? 4173 : 5173

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5_000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    actionTimeout: 10 * 1000,
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    // Las fechas y horas de la app se muestran en locale español; fijamos la
    // zona horaria para que la maquetación de fecha/hora sea estable.
    timezoneId: 'Europe/Madrid',
    locale: 'es-ES',
    // Headless por defecto. Define PW_HEADLESS=false para ver el navegador.
    headless: process.env.PW_HEADLESS !== 'false',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run dev',
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
})

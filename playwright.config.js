// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const CI = !!process.env.CI;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // O mapa ilustrado pesa para pintar; muitos navegadores ao mesmo tempo deixam tudo lento.
  workers: CI ? 2 : '50%',
  timeout: 60000,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  // As imagens de referência são geradas no Windows; em outro sistema as fontes mudam os pixels.
  ignoreSnapshots: CI,
  expect: {
    timeout: 5000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide', timeout: 20000 },
  },
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1400, height: 900 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    // Gravar trace a cada teste é caro (o DOM do mapa é enorme); só na repetição de um teste que falhou.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium' }],
});

// @ts-check
const { test, expect, viagem } = require('./helpers');

test.describe('Carregamento', () => {
  test('abre sem roteiro salvo e mostra o planejador vazio', async ({ app, page }) => {
    await app.abrir();
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('#tripTitle')).toHaveValue('Minha viagem pela Itália');
    await expect(page.locator('#stats')).toContainText('Definir datas');
    await expect(page.locator('[data-mapmode="plan"]')).toHaveClass(/\bon\b/);
    await expect(page.locator('#tab-mapa .pl-empty')).toContainText('Nenhuma cidade ainda');
    await expect(page.locator('#tab-mapa .pl-pick-banner')).toContainText('chega');
  });

  test('desenha todas as cidades do catálogo no mapa da Itália', async ({ app, page }) => {
    await app.abrir();
    const total = await app.avaliar(() => IT_CITIES.length);
    expect(total).toBeGreaterThan(40);
    await expect(page.locator('#tab-mapa .plan-svg .pl-city')).toHaveCount(total);
  });

  test('mostra as datas e o total de dias/noites de um roteiro salvo', async ({ app, page }) => {
    await app.abrir(viagem());
    await expect(page.locator('#tripTitle')).toHaveValue('Itália 2027');
    await expect(page.locator('#stats')).toContainText('06/02/2027 → 23/02/2027');
    await expect(page.locator('#stats')).toContainText('18 dias');
  });

  test('só a aba Roteiro fica disponível', async ({ app, page }) => {
    await app.abrir();
    await expect(page.locator('#tabs')).toBeHidden();
    await expect(page.locator('#tab-mapa')).toHaveClass(/\bactive\b/);
  });

  test('ignora dados corrompidos no localStorage e abre um roteiro novo', async ({ app, page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('__semeado')) return;
      sessionStorage.setItem('__semeado', '1');
      localStorage.setItem('roteiros-v2', '{isto não é json');
      localStorage.setItem('roteiro-v2:inicial', 'null');
    });
    await app.abrir();
    await expect(page.locator('#tripTitle')).toHaveValue('Minha viagem pela Itália');
  });

  test('no celular a página não rola para os lados', async ({ app, page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await app.abrir(viagem());
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sobra).toBeLessThanOrEqual(1);
  });
});

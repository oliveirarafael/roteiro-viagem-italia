// @ts-check
// Regressão visual: compara com as imagens em tests/visual.spec.js-snapshots/.
// Mudou o visual de propósito? Rode `npm run test:visual:update` e confira as imagens novas antes do commit.
const { test, expect, viagem } = require('./helpers');

test.use({ modoLeve: false });

const PLANO = viagem({ plan: { cities: [['roma', 6], ['florenca', 5], ['veneza', 5], ['milao', 3]].map(([k, n]) => ({ k, n, p: [] })), entry: 'roma', exit: 'milao', start: '2027-02-06', end: '2027-02-23' } });

/** Esconde o aviso flutuante e solta o cabeçalho fixo, que cobririam as capturas de elementos. */
const semFlutuantes = page => page.addStyleTag({ content: '#syncToast{display:none!important} header.top{position:static!important}' });

test('planejador vazio', async ({ app, page }) => {
  await app.abrir(viagem());
  await semFlutuantes(page);
  await expect(page).toHaveScreenshot('planejador-vazio.png');
});

test('planejador com sequência', async ({ app, page }) => {
  await app.abrir(PLANO);
  await semFlutuantes(page);
  await expect(page.locator('#tab-mapa .plan-grid')).toHaveScreenshot('planejador-mapa.png');
  await expect(page.locator('#tab-mapa .pl-seq')).toHaveScreenshot('planejador-sequencia.png');
});

test('aviso de noites que não batem com as datas', async ({ app, page }) => {
  await app.abrir(PLANO);
  await app.botao('gen').click();
  await expect(page.locator('#modal')).toHaveScreenshot('aviso-noites.png');
});

test('mapa do roteiro gerado', async ({ app, page }) => {
  await app.abrir(PLANO);
  await app.botao('gen').click();
  await app.modal().getByRole('button', { name: /Ajustar para/ }).click();
  await app.modo('route');
  await semFlutuantes(page);
  await expect(page.locator('#tab-mapa .map-overview')).toHaveScreenshot('roteiro-visao-geral.png');
  await expect(page.locator('#city-0')).toHaveScreenshot('roteiro-roma.png');
});

test('planejador no celular', async ({ app, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await app.abrir(PLANO);
  await semFlutuantes(page);
  await expect(page).toHaveScreenshot('celular-planejador.png');
});

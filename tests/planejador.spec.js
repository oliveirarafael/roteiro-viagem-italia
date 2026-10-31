// @ts-check
// "Planejar pela Itália": chegada, saída, sequência de cidades e noites.
const { test, expect, viagem } = require('./helpers');

test.beforeEach(async ({ app }) => { await app.abrir(viagem()); });

test('escolhe a chegada e a saída clicando no mapa', async ({ app, page }) => {
  await app.clicarNoMapa('roma');
  await expect(app.toast()).toContainText('Chegada: Roma');
  await expect(page.locator('#tab-mapa .pl-pick-banner')).toContainText('volta para casa');
  expect(await app.sequencia()).toEqual(['roma:4']);

  await app.clicarNoMapa('milao');
  await expect(app.toast()).toContainText('Saída: Milão');
  await expect(page.locator('#tab-mapa .pl-pick-banner')).toHaveCount(0);
  await expect(page.locator('#tab-mapa .pl-ends.done')).toBeVisible();
  expect(await app.sequencia()).toEqual(['roma:4', 'milao:2']);

  const s = await app.estado();
  expect(s.plan).toMatchObject({ entry: 'roma', exit: 'milao' });
  await expect(app.paradas()).toHaveCount(2);
  await expect(app.paradas().first()).toContainText('entrada');
  await expect(app.paradas().last()).toContainText('saída');
});

test('"Voltar pela mesma cidade" fecha a viagem onde começou', async ({ app }) => {
  await app.definirChegadaESaida('roma', 'roma');
  expect(await app.sequencia()).toEqual(['roma:4', 'roma:1']);
  await expect(app.paradas().last()).toContainText('volta');
});

test('cidades novas entram entre a chegada e a saída', async ({ app }) => {
  await app.definirChegadaESaida('roma', 'milao');
  await app.incluirCidade('florenca');
  await app.incluirCidade('veneza');
  expect(await app.sequencia()).toEqual(['roma:4', 'florenca:3', 'veneza:3', 'milao:2']);
  await expect(app.paradas()).toHaveCount(4);
  await expect(app.page.locator('#tab-mapa .pl-tot')).toContainText('4 paradas · 12 noites');
  await expect(app.cidadeNoMapa('florenca')).toHaveClass(/\bon\b/);
});

test('painel da cidade mostra descrição, como chegar e o trecho a partir da parada anterior', async ({ app, page }) => {
  await app.definirChegadaESaida('roma', 'milao');
  await page.locator('#tab-mapa .pl-chip[data-city="florenca"]').click();
  const painel = page.locator('#tab-mapa .pl-detail');
  await expect(painel.locator('h3')).toHaveText('Florença');
  await expect(painel).toContainText('Toscana · sugestão: 3 noites');
  await expect(painel).toContainText('Como chegar');
  await expect(painel.locator('[data-pl="add-city"]')).toHaveText('+ Incluir Florença no roteiro');
});

test('ajusta noites com + e −, sem passar de 0', async ({ app }) => {
  await app.definirChegadaESaida('roma', 'milao');
  const roma = app.paradas().first();
  await roma.locator('[data-pl="n+"]').click();
  await expect(roma.locator('.ps-nights span')).toHaveText('5 noites');
  for (let i = 0; i < 6; i++) await app.paradas().first().locator('[data-pl="n-"]').click();
  await expect(app.paradas().first().locator('.ps-nights span')).toHaveText('0 noites');
  await expect(app.paradas().first()).toContainText('Sem pernoite');
  expect(await app.sequencia()).toEqual(['roma:0', 'milao:2']);
});

test('reordena e remove paradas', async ({ app }) => {
  await app.definirChegadaESaida('roma', 'milao');
  await app.incluirCidade('florenca');
  await app.incluirCidade('veneza');
  await app.paradas().nth(2).locator('[data-pl="up"]').click();
  expect(await app.sequencia()).toEqual(['roma:4', 'veneza:3', 'florenca:3', 'milao:2']);
  await expect(app.paradas().first().locator('[data-pl="up"]')).toBeDisabled();
  await expect(app.paradas().last().locator('[data-pl="down"]')).toBeDisabled();
  await app.paradas().nth(1).locator('[data-pl="del"]').click();
  expect(await app.sequencia()).toEqual(['roma:4', 'florenca:3', 'milao:2']);
});

test('trocar a chegada substitui a primeira cidade', async ({ app, page }) => {
  await app.definirChegadaESaida('roma', 'milao');
  await page.locator('#tab-mapa [data-pl="pick"][data-end="entry"]').click();
  await expect(page.locator('#tab-mapa .pl-pick-banner')).toContainText('chega');
  await app.clicarNoMapa('napoles');
  expect(await app.sequencia()).toEqual(['napoles:3', 'milao:2']);
  expect((await app.estado()).plan.entry).toBe('napoles');
});

test('busca filtra as cidades por nome, região ou lugar', async ({ app, page }) => {
  await app.definirChegadaESaida('roma', 'milao');
  const busca = page.locator('#tab-mapa .pl-search');
  await busca.fill('toscana');
  await expect(page.locator('#tab-mapa .pl-region b')).toHaveText(['Toscana']);
  await expect(busca).toBeFocused();
  await busca.fill('coliseu');
  await expect(page.locator('#tab-mapa .pl-chip')).toHaveCount(1);
  await expect(page.locator('#tab-mapa .pl-chip')).toHaveAttribute('data-city', 'roma');
  await busca.fill('');
  expect(await page.locator('#tab-mapa .pl-chip').count()).toBe(await app.avaliar(() => IT_CITIES.length));
});

test('limpar apaga a sequência (com confirmação) e desfazer recupera', async ({ app, page }) => {
  await app.definirChegadaESaida('roma', 'milao');
  await app.incluirCidade('florenca');

  app.aceitarDialogos = false;
  await app.botao('clear').click();
  expect(await app.sequencia()).toEqual(['roma:4', 'florenca:3', 'milao:2']);

  app.aceitarDialogos = true;
  await app.botao('clear').click();
  expect(app.dialogos.at(-1)?.mensagem).toContain('Limpar o roteiro inteiro?');
  await expect(page.locator('#tab-mapa .pl-empty')).toBeVisible();
  const s = await app.estado();
  expect(s.plan.cities).toEqual([]);
  expect(s.plan.entry).toBeUndefined();
  expect(s.plan.end).toBe('2027-02-23');

  await app.toast().locator('[data-t="undo"]').click();
  expect(await app.sequencia()).toEqual(['roma:4', 'florenca:3', 'milao:2']);
});

test('Ctrl+Z e o botão Desfazer voltam um passo', async ({ app, page }) => {
  await expect(page.locator('#undoBtn')).toBeDisabled();
  await app.definirChegadaESaida('roma', 'milao');
  await app.paradas().first().locator('[data-pl="n+"]').click();
  expect(await app.sequencia()).toEqual(['roma:5', 'milao:2']);
  await page.keyboard.press('Control+z');
  expect(await app.sequencia()).toEqual(['roma:4', 'milao:2']);
  await page.locator('#undoBtn').click();
  expect(await app.sequencia()).toEqual(['roma:4']);
});

test('a sequência continua salva depois de recarregar a página', async ({ app }) => {
  await app.definirChegadaESaida('roma', 'milao');
  await app.incluirCidade('florenca');
  await app.recarregar();
  await expect(app.paradas()).toHaveCount(3);
  expect(await app.sequencia()).toEqual(['roma:4', 'florenca:3', 'milao:2']);
});

test('zoom do mapa: aproxima, afasta e volta à Itália inteira', async ({ app, page }) => {
  const svg = page.locator('#tab-mapa .plan-svg');
  const inicial = await svg.getAttribute('viewBox');
  await page.locator('[data-zoom="in"]').click();
  await expect(svg).not.toHaveAttribute('viewBox', inicial ?? '');
  await expect(page.locator('#tab-mapa .pl-map-wrap')).toHaveClass(/zoomed/);
  await page.locator('[data-zoom="reset"]').click();
  await expect(svg).toHaveAttribute('viewBox', inicial ?? '');
  await expect(page.locator('[data-zoom="out"]')).toBeDisabled();
});

// @ts-check
// "Mapa do roteiro": depois de gerar, escolher lugares, editar e excluir atividades.
const { test, expect, viagem } = require('./helpers');

const PLANO = viagem({ plan: { cities: [['roma', 6], ['florenca', 4], ['veneza', 4], ['milao', 3]].map(([k, n]) => ({ k, n, p: [] })), entry: 'roma', exit: 'milao', start: '2027-02-06', end: '2027-02-23' } });

const itens = s => s.days.flatMap(d => d.items.map(it => ({ ...it, dia: d.id, data: d.date, base: d.base })));

test.beforeEach(async ({ app }) => {
  await app.abrir(PLANO);
  await app.botao('gen').click();
  await app.toast().getByRole('button', { name: 'Ver dia a dia' }).click();
  await expect(app.page.locator('[data-mapmode="route"]')).toHaveClass(/\bon\b/);
});

/** Inclui a 1ª sugestão da cidade `si` e devolve o id do lugar do catálogo. */
async function incluirSugestao(app, si = 0) {
  const botao = app.page.locator(`#city-${si} [data-sug]`).first();
  const id = await botao.getAttribute('data-sug');
  await botao.click();
  await expect(app.page.locator(`#city-${si} [data-sug="${id}"]`)).toHaveCount(0);
  return id;
}

async function abrirPino(app, id) {
  await app.page.locator(`#tab-mapa .pin[data-id="${id}"]`).click();
  const pop = app.page.locator('#mapPop');
  await expect(pop).toBeVisible();
  return pop;
}

test('mostra as cidades-base com noites e datas', async ({ app, page }) => {
  await expect(page.locator('#tab-mapa .map-sub')).toContainText('06/02/2027 → 23/02/2027');
  await expect(page.locator('#tab-mapa .city-section')).toHaveCount(4);
  const paradas = page.locator('#tab-mapa .stop-list li');
  await expect(paradas).toHaveCount(4);
  await expect(paradas.nth(0)).toContainText('Roma · 6 noites');
  await expect(paradas.nth(0)).toContainText('06/02 → 12/02');
  await expect(paradas.nth(3)).toContainText('Milão · 3 noites');
  await expect(paradas.nth(3)).toContainText('20/02 → 23/02');
  await expect(page.locator('#tab-mapa .overview, #tab-mapa .map-overview svg').first()).toBeVisible();
});

test('incluir um lugar sugerido cria a atividade e mantém o roteiro em dia com a sequência', async ({ app, page }) => {
  const id = await incluirSugestao(app, 0);
  await expect(app.toast()).toContainText('adicionada no Roteiro');
  const s = await app.estado();
  const it = itens(s).find(i => i.cat === id);
  expect(it).toBeTruthy();
  expect(it?.base).toBe('Roma');
  expect(s.plan.cities[0].p).toContain(id);
  await app.modo('plan');
  await expect(page.locator('#tab-mapa .gen-st.ok', { hasText: 'roteiro em dia' })).toBeVisible();
});

test('o lugar sugerido entra no dia escolhido', async ({ app, page }) => {
  const select = page.locator('#city-1 select.add-day');
  const terceiroDia = await select.locator('option').nth(2).getAttribute('value');
  await select.selectOption(terceiroDia ?? '');
  const id = await incluirSugestao(app, 1);
  const it = itens(await app.estado()).find(i => i.cat === id);
  expect(it?.dia).toBe(terceiroDia);
  expect(it?.base).toBe('Florença');
});

test('editar pelo popup do pino muda título e horário, e fica salvo', async ({ app, page }) => {
  const id = await incluirSugestao(app, 0);
  const itemId = itens(await app.estado()).find(i => i.cat === id)?.id;
  const pop = await abrirPino(app, itemId);
  await pop.locator('input[name="title"]').fill('Visita guiada');
  await pop.locator('input[name="start"]').fill('09:00');
  await pop.locator('input[name="end"]').fill('11:00');
  await pop.getByRole('button', { name: 'Salvar' }).click();

  const it = itens(await app.estado()).find(i => i.id === itemId);
  expect(it).toMatchObject({ title: 'Visita guiada', start: '09:00', end: '11:00' });
  await app.recarregar();
  expect(itens(await app.estado()).find(i => i.id === itemId)).toMatchObject({ title: 'Visita guiada', start: '09:00' });
});

test('horários sobrepostos aparecem como conflito', async ({ app, page }) => {
  await expect(page.locator('#stats')).toContainText('Horários sem conflito');
  const ids = [await incluirSugestao(app, 0), await incluirSugestao(app, 0)];
  const s = await app.estado();
  for (const id of ids) {
    const itemId = itens(s).find(i => i.cat === id)?.id;
    const pop = await abrirPino(app, itemId);
    await pop.locator('input[name="start"]').fill('10:00');
    await pop.locator('input[name="end"]').fill('12:00');
    await pop.getByRole('button', { name: 'Salvar' }).click();
  }
  await expect(page.locator('#stats .warn-stat')).toContainText('Conflitos de horário: 2 atividades');
  await expect(page.locator('#city-0 .check-card')).toContainText('1 conflito de horário');
});

test('excluir pelo popup pede confirmação e dá para desfazer', async ({ app }) => {
  const id = await incluirSugestao(app, 0);
  const itemId = itens(await app.estado()).find(i => i.cat === id)?.id;

  app.aceitarDialogos = false;
  await (await abrirPino(app, itemId)).getByRole('button', { name: 'Excluir' }).click();
  expect(itens(await app.estado()).some(i => i.id === itemId)).toBe(true);

  app.aceitarDialogos = true;
  await app.page.locator('#mapPop [data-pop="delete"]').click();
  await expect(app.toast()).toContainText('saiu');
  expect(itens(await app.estado()).some(i => i.id === itemId)).toBe(false);

  await app.toast().locator('[data-t="undo"]').click();
  expect(itens(await app.estado()).some(i => i.id === itemId)).toBe(true);
});

test('"Mais detalhes" abre o modal completo: tipo, custo em € e US$ e reserva', async ({ app }) => {
  const id = await incluirSugestao(app, 0);
  const itemId = itens(await app.estado()).find(i => i.cat === id)?.id;
  await (await abrirPino(app, itemId)).getByRole('button', { name: 'Mais detalhes' }).click();
  const modal = app.modal();
  await expect(modal.locator('h3')).toHaveText('Editar atividade');
  await modal.locator('select[name="type"]').selectOption('comida');
  await modal.locator('input[name="start"]').fill('20:00');
  await modal.locator('input[name="cost"]').fill('40');
  await expect(modal.locator('input[name="costUsd"]')).toHaveValue('44.8');
  await modal.locator('select[name="status"]').selectOption('reservado');
  await modal.locator('input[name="link"]').fill('www.exemplo.com');
  await modal.getByRole('button', { name: 'Salvar' }).click();
  await expect(modal).toBeHidden();

  expect(itens(await app.estado()).find(i => i.id === itemId)).toMatchObject({ type: 'comida', start: '20:00', cost: 40, status: 'reservado', link: 'https://www.exemplo.com', base: 'Roma' });
});

test('o mapa do roteiro não tem mais "Adicionar atividade" por clique', async ({ page }) => {
  await expect(page.locator('#tab-mapa [data-add-mode]')).toHaveCount(0);
});

test('voltar a Planejar mantém a sequência e o roteiro gerado', async ({ app }) => {
  await app.modo('plan');
  expect(await app.sequencia()).toEqual(['roma:6', 'florenca:4', 'veneza:4', 'milao:3']);
  await expect(app.botao('gen')).toHaveText('Atualizar roteiro');
  expect((await app.estado()).days).toHaveLength(18);
});

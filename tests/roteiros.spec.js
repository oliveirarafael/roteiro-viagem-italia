// @ts-check
// Vários roteiros ("Meus roteiros") e o modal de nome e datas.
const { test, expect, viagem } = require('./helpers');

test.beforeEach(async ({ app }) => { await app.abrir(viagem()); });

async function abrirPainel(page) {
  await page.locator('#tripsBtn').click();
  const painel = page.locator('#tripsPanel');
  await expect(painel).toBeVisible();
  return painel;
}

test('o painel lista o roteiro aberto com datas e contagem', async ({ page }) => {
  await expect(page.locator('#tripsBtn .n')).toHaveText('1');
  const painel = await abrirPainel(page);
  const card = painel.locator('.trip-card');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Itália 2027');
  await expect(card).toContainText('06/02/2027');
  await expect(card).toContainText('23/02/2027');
  await expect(card).toContainText('18 dias');
  await expect(card.locator('.tc-badge')).toHaveText('aberto');
});

test('cria um roteiro novo e troca entre os dois', async ({ app, page }) => {
  const painel = await abrirPainel(page);
  await painel.locator('[data-ta="new"]').click();
  const modal = app.modal();
  await modal.locator('input[name="title"]').fill('Sicília 2028');
  await modal.locator('input[name="start"]').fill('2028-05-01');
  await modal.locator('input[name="end"]').fill('2028-05-10');
  await modal.getByRole('button', { name: 'Criar roteiro' }).click();

  await expect(page.locator('#tripTitle')).toHaveValue('Sicília 2028');
  await expect(page.locator('#stats')).toContainText('01/05/2028 → 10/05/2028');
  await expect(page.locator('#tripsBtn .n')).toHaveText('2');

  const p2 = await abrirPainel(page);
  await p2.locator('.trip-card', { hasText: 'Itália 2027' }).locator('[data-ta="open"]').click();
  await expect(page.locator('#tripTitle')).toHaveValue('Itália 2027');
  await expect(page.locator('#stats')).toContainText('06/02/2027 → 23/02/2027');
});

test('novo roteiro não aceita último dia antes do primeiro', async ({ app, page }) => {
  const painel = await abrirPainel(page);
  await painel.locator('[data-ta="new"]').click();
  const modal = app.modal();
  await modal.locator('input[name="title"]').fill('Errado');
  await modal.locator('input[name="start"]').fill('2028-05-10');
  await modal.locator('input[name="end"]').fill('2028-05-01');
  await modal.getByRole('button', { name: 'Criar roteiro' }).click();
  await expect(modal.locator('#ntErr')).toHaveText('O último dia precisa ser igual ou depois do primeiro.');
  await expect(page.locator('#tripsBtn .n')).toHaveText('1');
});

test('duplicar e excluir roteiros', async ({ app, page }) => {
  let painel = await abrirPainel(page);
  await painel.locator('[data-ta="dup"]').click();
  await expect(page.locator('#tripTitle')).toHaveValue('Itália 2027 (cópia)');
  await expect(page.locator('#tripsBtn .n')).toHaveText('2');

  painel = await abrirPainel(page);
  await painel.locator('.trip-card.on [data-ta="del"]').click();
  expect(app.dialogos.at(-1)?.mensagem).toContain('Excluir o roteiro “Itália 2027 (cópia)”?');
  await expect(page.locator('#tripTitle')).toHaveValue('Itália 2027');
  await expect(page.locator('#tripsBtn .n')).toHaveText('1');
});

test('não deixa excluir o único roteiro', async ({ app, page }) => {
  const painel = await abrirPainel(page);
  await painel.locator('[data-ta="del"]').click();
  expect(app.dialogos.at(-1)).toEqual({ tipo: 'alert', mensagem: 'Este é o único roteiro. Crie outro antes de excluir este.' });
  await expect(page.locator('#tripsBtn .n')).toHaveText('1');
});

test('mudar o nome pelo cabeçalho fica salvo', async ({ app, page }) => {
  await page.locator('#tripTitle').fill('Itália com a família');
  await page.locator('#tripTitle').press('Enter');
  await page.locator('#tripTitle').blur();
  await app.recarregar();
  await expect(page.locator('#tripTitle')).toHaveValue('Itália com a família');
});

test.describe('Modal de nome e datas', () => {
  test('adiar a viagem desloca os dias e as datas do plano', async ({ app, page }) => {
    await page.locator('#stats [data-dates]').click();
    const modal = app.modal();
    await expect(modal.locator('h3')).toHaveText('Nome e datas do roteiro');
    await modal.locator('input[name="start"]').fill('2027-03-06');
    await modal.locator('input[name="end"]').fill('2027-03-23');
    await expect(modal.locator('#dtHint')).toContainText('para frente 28 dias');
    await modal.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.locator('#stats')).toContainText('06/03/2027 → 23/03/2027');
    const s = await app.estado();
    expect(s.days[0].date).toBe('2027-03-06');
    expect(s.days.at(-1).date).toBe('2027-03-23');
    expect(s.plan).toMatchObject({ start: '2027-03-06', end: '2027-03-23' });
  });

  test('recusa período maior que 120 dias', async ({ app, page }) => {
    await page.locator('#stats [data-dates]').click();
    const modal = app.modal();
    await modal.locator('input[name="end"]').fill('2027-08-01');
    await modal.getByRole('button', { name: 'Salvar' }).click();
    await expect(modal.locator('#dtErr')).toHaveText('Máximo de 120 dias por roteiro.');
    expect((await app.estado()).days).toHaveLength(18);
  });
});

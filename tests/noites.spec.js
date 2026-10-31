// @ts-check
// Aviso "As noites não batem com as datas": as datas de chegada e de volta são fixas.
const { test, expect, viagem } = require('./helpers');

const comPlano = (cidades) => viagem({ plan: { cities: cidades.map(([k, n]) => ({ k, n, p: [] })), entry: cidades[0][0], exit: cidades.at(-1)[0], start: '2027-02-06', end: '2027-02-23' } });
const DEZENOVE = [['roma', 6], ['florenca', 5], ['veneza', 5], ['milao', 3]];
const DOZE = [['roma', 4], ['florenca', 3], ['veneza', 3], ['milao', 2]];
const DEZESSETE = [['roma', 6], ['florenca', 4], ['veneza', 4], ['milao', 3]];

const noites = s => s.plan.cities.reduce((a, pc) => a + pc.n, 0);

test('com noites a mais, o aviso só informa e não oferece mudar as datas', async ({ app, page }) => {
  await app.abrir(comPlano(DEZENOVE));
  await app.botao('gen').click();
  const modal = app.modal();
  await expect(modal).toBeVisible();
  await expect(modal.locator('h3')).toHaveText('As noites não batem com as datas');
  await expect(modal).toContainText('A sua sequência soma 19 noites, mas a viagem tem 17 noites (06/02/2027 a 23/02/2027).');
  await expect(modal).toContainText('As datas de chegada e de volta são fixas.');
  await expect(modal.locator('.modal-actions button')).toHaveText(['Cancelar', 'Ajustar para 17 noites e gerar']);
  await expect(modal.getByRole('button', { name: /Gerar com/ })).toHaveCount(0);
  await expect(modal).not.toContainText('termina em');
});

test('Cancelar fecha o aviso sem gerar nem mexer nas datas', async ({ app }) => {
  await app.abrir(comPlano(DEZENOVE));
  const antes = await app.estado();
  await app.botao('gen').click();
  await app.modal().getByRole('button', { name: 'Cancelar' }).click();
  await expect(app.modal()).toBeHidden();
  const depois = await app.estado();
  expect(depois.days).toEqual(antes.days);
  expect(depois.plan.genKey).toBeUndefined();
  expect(depois.plan.end).toBe('2027-02-23');
  expect(noites(depois)).toBe(19);
});

test('Esc fecha o aviso sem gerar', async ({ app, page }) => {
  await app.abrir(comPlano(DEZENOVE));
  await app.botao('gen').click();
  await expect(app.modal()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(app.modal()).toBeHidden();
  expect((await app.estado()).plan.genKey).toBeUndefined();
});

for (const [nome, seq, n] of [['a mais', DEZENOVE, 19], ['a menos', DOZE, 12]]) {
  test(`com noites ${nome} (${n}), ajustar gera exatamente de 06/02 a 23/02`, async ({ app, page }) => {
    await app.abrir(comPlano(seq));
    await app.botao('gen').click();
    await expect(app.modal()).toContainText(`soma ${n} noites`);
    await app.modal().getByRole('button', { name: 'Ajustar para 17 noites e gerar' }).click();
    await expect(app.modal()).toBeHidden();

    const s = await app.estado();
    expect(noites(s)).toBe(17);
    expect(s.days).toHaveLength(18);
    expect(s.days[0].date).toBe('2027-02-06');
    expect(s.days.at(-1)).toMatchObject({ date: '2027-02-23', base: 'Voo', title: 'Volta' });
    expect(s.plan).toMatchObject({ start: '2027-02-06', end: '2027-02-23' });
    expect(s.plan.cities.map(pc => pc.k)).toEqual(['roma', 'florenca', 'veneza', 'milao']);

    await expect(app.toast()).toContainText('Roteiro gerado: 18 dias, de 06/02/2027 a 23/02/2027.');
    await expect(page.locator('#stats')).toContainText('06/02/2027 → 23/02/2027');
    await expect(page.locator('#stats')).toContainText('18 dias · 17 noites');
    await expect(page.locator('#tab-mapa .gen-st.ok').first()).toContainText('17 de 17 noites');
  });
}

test('com as noites certas, gera direto sem aviso', async ({ app }) => {
  await app.abrir(comPlano(DEZESSETE));
  await app.botao('gen').click();
  await expect(app.toast()).toContainText('Roteiro gerado: 18 dias, de 06/02/2027 a 23/02/2027.');
  await expect(app.modal()).toBeHidden();
  const s = await app.estado();
  expect(s.plan.cities.map(pc => pc.n)).toEqual([6, 4, 4, 3]);
});

test('o selo da sequência mostra a diferença e "Ajustar noites" corrige sem gerar', async ({ app, page }) => {
  await app.abrir(comPlano(DEZENOVE));
  await expect(page.locator('#tab-mapa .gen-st.warn').first()).toHaveText('2 noites a mais (19 de 17)');
  await app.botao('fit').click();
  await expect(page.locator('#tab-mapa .gen-st.ok').first()).toHaveText('✓ 17 de 17 noites da viagem');
  const s = await app.estado();
  expect(noites(s)).toBe(17);
  expect(s.plan.genKey).toBeUndefined();
});

test('atualizar um roteiro já gerado pede confirmação e mantém as datas', async ({ app }) => {
  await app.abrir(comPlano(DEZESSETE));
  await app.botao('gen').click();
  await expect(app.toast()).toContainText('Roteiro gerado');
  await app.paradas().first().locator('[data-pl="n+"]').click();
  await expect(app.botao('gen')).toHaveText('Atualizar roteiro');
  await app.botao('gen').click();
  await expect(app.modal()).toContainText('soma 18 noites, mas a viagem tem 17 noites');
  await app.modal().getByRole('button', { name: 'Ajustar para 17 noites e gerar' }).click();
  expect(app.dialogos.at(-1)?.mensagem).toContain('Atualizar o roteiro com a sequência atual?');
  await expect(app.toast()).toContainText('Roteiro atualizado: 18 dias, de 06/02/2027 a 23/02/2027.');
});

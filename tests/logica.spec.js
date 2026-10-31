// @ts-check
// Regras de negócio, testadas chamando as funções do próprio app dentro da página.
const { test, expect } = require('./helpers');

const SEQ = [{ k: 'roma', n: 4 }, { k: 'florenca', n: 3 }, { k: 'veneza', n: 3 }, { k: 'milao', n: 2 }];

test.beforeEach(async ({ app }) => { await app.abrir(); });

test('datas: soma de dias, diferença e formatação', async ({ app }) => {
  const r = await app.avaliar(() => ({
    virada: addDays('2026-12-31', 1),
    fevereiro: addDays('2027-02-27', 2),
    bissexto: addDays('2028-02-28', 1),
    voltar: addDays('2027-03-01', -1),
    noites: diffDays('2027-02-06', '2027-02-23'),
    br: fmtBR('2027-02-06'),
    bry: fmtBRY('2027-02-06'),
    vazio: fmtBRY(''),
    semana: weekday('2027-02-06'),
  }));
  expect(r).toEqual({
    virada: '2027-01-01', fevereiro: '2027-03-01', bissexto: '2028-02-29', voltar: '2027-02-28',
    noites: 17, br: '06/02', bry: '06/02/2027', vazio: '', semana: 'sáb',
  });
});

test('textos: escapa HTML, normaliza e corrige links', async ({ app }) => {
  const r = await app.avaliar(() => ({
    esc: esc('<b a="1">&\'</b>'),
    norm: norm('  Florença Ã '),
    url: fixUrl('www.exemplo.com'),
    urlOk: fixUrl('https://a.com'),
    urlVazia: fixUrl('  '),
  }));
  expect(r).toEqual({
    esc: '&lt;b a=&quot;1&quot;&gt;&amp;&#39;&lt;/b&gt;',
    norm: 'florenca a',
    url: 'https://www.exemplo.com',
    urlOk: 'https://a.com',
    urlVazia: '',
  });
});

test.describe('fitNights: distribui as noites da viagem entre as cidades', () => {
  for (const alvo of [17, 12, 8, 4, 30]) {
    test(`fecha exatamente em ${alvo} noites`, async ({ app }) => {
      const ns = await app.avaliar(([seq, t]) => { const pcs = seq.map(x => ({ ...x, p: [] })); fitNights(pcs, t); return pcs.map(pc => pc.n); }, [SEQ, alvo]);
      expect(ns.reduce((a, b) => a + b, 0)).toBe(alvo);
      ns.forEach(n => expect(n).toBeGreaterThanOrEqual(1));
    });
  }

  test('17 noites seguem o tempo recomendado de cada cidade', async ({ app }) => {
    const ns = await app.avaliar(seq => { const pcs = seq.map(x => ({ ...x, p: [] })); fitNights(pcs, 17); return pcs.map(pc => pc.n); }, SEQ);
    expect(ns).toEqual([6, 4, 4, 3]);
  });

  test('cidade sem pernoite (0 noites) continua com 0', async ({ app }) => {
    const ns = await app.avaliar(() => {
      const pcs = [{ k: 'roma', n: 4, p: [] }, { k: 'pisa', n: 0, p: [] }, { k: 'florenca', n: 3, p: [] }];
      fitNights(pcs, 10); return pcs.map(pc => pc.n);
    });
    expect(ns[1]).toBe(0);
    expect(ns[0] + ns[2]).toBe(10);
  });

  test('sem alvo ou sem cidades não altera nada', async ({ app }) => {
    const r = await app.avaliar(seq => {
      const a = seq.map(x => ({ ...x, p: [] })); fitNights(a, 0);
      const b = []; fitNights(b, 10);
      return { a: a.map(pc => pc.n), b: b.length };
    }, SEQ);
    expect(r).toEqual({ a: [4, 3, 3, 2], b: 0 });
  });
});

test.describe('generateFromPlan: monta os dias a partir da sequência', () => {
  test('um dia por noite + dia da volta, com datas seguidas', async ({ app }) => {
    const dias = await app.avaliar(seq => {
      state.plan.cities = seq.map(x => ({ ...x, p: [] }));
      return generateFromPlan('2027-02-06').map(d => ({ date: d.date, base: d.base, title: d.title, itens: d.items.map(i => i.title) }));
    }, SEQ);
    expect(dias).toHaveLength(12 + 1);
    expect(dias[0]).toMatchObject({ date: '2027-02-06', base: 'Roma', title: 'Chegada em Roma' });
    expect(dias.at(-1)).toMatchObject({ date: '2027-02-18', base: 'Voo', title: 'Volta' });
    for (let i = 1; i < dias.length; i++) {
      const ant = new Date(dias[i - 1].date), atual = new Date(dias[i].date);
      expect((+atual - +ant) / 86400000).toBe(1);
    }
    expect(dias.filter(d => d.base === 'Roma')).toHaveLength(4);
    expect(dias.filter(d => d.base === 'Florença')).toHaveLength(3);
    expect(dias.filter(d => d.base === 'Veneza')).toHaveLength(3);
    expect(dias.filter(d => d.base === 'Milão')).toHaveLength(2);
    expect(dias[4]).toMatchObject({ base: 'Florença', title: 'Roma → Florença' });
    expect(dias[4].itens[0]).toBe('Trem Roma → Florença');
  });

  test('os lugares escolhidos viram atividades no dia da cidade', async ({ app }) => {
    const r = await app.avaliar(() => {
      const ids = CAT.roma.places.slice(0, 3).map(p => p.id);
      state.plan.cities = [{ k: 'roma', n: 2, p: ids }];
      const dias = generateFromPlan('2027-02-06');
      return { nomes: CAT.roma.places.slice(0, 3).map(p => p.name), itens: dias.filter(d => d.base === 'Roma').flatMap(d => d.items.map(i => i.title)), cats: dias.flatMap(d => d.items.map(i => i.cat)).filter(Boolean) };
    });
    expect(r.itens).toEqual(r.nomes);
    expect(r.cats).toHaveLength(3);
  });

  test('cidade com 0 noites não cria dia próprio', async ({ app }) => {
    const bases = await app.avaliar(() => {
      state.plan.cities = [{ k: 'florenca', n: 2, p: [] }, { k: 'pisa', n: 0, p: [] }, { k: 'roma', n: 2, p: [] }];
      return generateFromPlan('2027-02-06').map(d => d.base);
    });
    expect(bases).toEqual(['Florença', 'Florença', 'Roma', 'Roma', 'Voo']);
  });
});

test('legInfo: trechos conhecidos e estimativas', async ({ app }) => {
  const r = await app.avaliar(() => ({
    romaFlorenca: legInfo(CAT.roma, CAT.florenca),
    florencaRoma: legInfo(CAT.florenca, CAT.roma),
    ilha: legInfo(CAT.milao, CAT.cagliari),
    semTabela: legInfo(CAT.roma, CAT.alghero),
  }));
  expect(r.romaFlorenca).toMatchObject({ mode: 'trem', min: 95, est: false });
  expect(r.florencaRoma).toMatchObject({ mode: 'trem', min: 95 });
  expect(r.ilha.mode).toBe('voo');
  expect(r.semTabela.mode).toBe('voo');
});

test('computeConflicts: acusa só horários que se sobrepõem no mesmo dia', async ({ app }) => {
  const r = await app.avaliar(() => {
    state.days = [
      { id: 'a', date: '2027-02-06', base: 'Roma', title: '', note: '', items: [
        { id: 'x', start: '09:00', end: '11:00', title: 'Coliseu' },
        { id: 'y', start: '10:30', end: '12:00', title: 'Fórum' },
        { id: 'z', start: '12:00', end: '13:00', title: 'Almoço' },
      ] },
      { id: 'b', date: '2027-02-07', base: 'Roma', title: '', note: '', items: [{ id: 'w', start: '09:00', end: '11:00', title: 'Vaticano' }] },
    ];
    const m = computeConflicts();
    return Object.fromEntries([...m].map(([k, v]) => [k, v.map(o => o.id)]));
  });
  expect(r).toEqual({ x: ['y'], y: ['x'] });
});

test('getStays: agrupa dias seguidos na mesma cidade e conta as noites', async ({ app }) => {
  const r = await app.avaliar(() => {
    state.days = ['Roma', 'Roma', 'Florença', 'Florença', 'Florença', 'Voo'].map((base, i) => ({ id: 'd' + i, date: addDays('2027-02-06', i), base, title: '', note: '', items: [] }));
    return getStays().map(s => ({ base: s.base, checkin: s.checkin, checkout: s.checkout, nights: s.nights }));
  });
  expect(r).toEqual([
    { base: 'Roma', checkin: '2027-02-06', checkout: '2027-02-08', nights: 2 },
    { base: 'Florença', checkin: '2027-02-08', checkout: '2027-02-11', nights: 3 },
  ]);
});

test('withDates: muda as datas do roteiro sem perder a ordem', async ({ app }) => {
  const r = await app.avaliar(() => {
    const s = { ...defaultState(), days: ['Roma', 'Roma', 'Florença'].map((base, i) => ({ id: 'd' + i, date: addDays('2027-02-06', i), base, title: '', note: '', items: [] })) };
    const adiado = withDates(s, '2027-03-01', '2027-03-05');
    const encurtado = withDates(s, '2027-02-06', '2027-02-07');
    return {
      adiado: adiado.days.map(d => `${d.date} ${d.base}`), plano: [adiado.plan.start, adiado.plan.end],
      encurtado: encurtado.days.map(d => d.date), original: s.days[0].date,
    };
  });
  expect(r.adiado).toEqual(['2027-03-01 Roma', '2027-03-02 Roma', '2027-03-03 Florença', '2027-03-04 Florença', '2027-03-05 Florença']);
  expect(r.plano).toEqual(['2027-03-01', '2027-03-05']);
  expect(r.encurtado).toEqual(['2027-02-06', '2027-02-07']);
  expect(r.original).toBe('2027-02-06');
});

test('migrate: completa campos que faltam em roteiros antigos', async ({ app }) => {
  const s = await app.avaliar(() => migrate({ days: [{ date: '2027-02-06', items: [{ title: 'x' }] }] }));
  expect(s.settings.travelers).toBe(2);
  expect(s.plan).toEqual({ cities: [] });
  expect(s.hotels).toEqual([]);
  expect(s.days[0].id).toBeTruthy();
  expect(s.days[0].items[0].id).toBeTruthy();
});

test.describe('Catálogo de cidades e lugares', () => {
  test('cidades com chave única, coordenadas na região e noites sugeridas', async ({ app }) => {
    const problemas = await app.avaliar(() => {
      const out = [], vistos = new Set();
      IT_CITIES.forEach(c => {
        if (vistos.has(c.k)) out.push(`cidade repetida: ${c.k}`); vistos.add(c.k);
        if (!(c.lat > 36 && c.lat < 48 && c.lon > 6 && c.lon < 19)) out.push(`${c.k}: coordenada fora da Itália/Suíça`);
        if (!(c.n >= 1)) out.push(`${c.k}: noites sugeridas inválidas`);
        if (!c.name || !c.reg || !c.d) out.push(`${c.k}: nome/região/descrição vazios`);
        if (!c.places.length) out.push(`${c.k}: sem lugares`);
      });
      return out;
    });
    expect(problemas).toEqual([]);
  });

  test('lugares com id único, coordenadas próximas da cidade e duração', async ({ app }) => {
    const problemas = await app.avaliar(() => {
      const out = [], vistos = new Set();
      IT_CITIES.forEach(c => c.places.forEach(p => {
        if (vistos.has(p.id)) out.push(`lugar repetido: ${p.id}`); vistos.add(p.id);
        if (haversine([c.lat, c.lon], [p.lat, p.lon]) > 150) out.push(`${p.id}: a mais de 150 km de ${c.name}`);
        if (!(p.h > 0)) out.push(`${p.id}: duração inválida`);
        if (![1, 2, 3].includes(p.lv)) out.push(`${p.id}: nível inválido`);
        if (!p.d) out.push(`${p.id}: sem descrição`);
      }));
      return out;
    });
    expect(problemas).toEqual([]);
  });

  test('destaques (★★★), trechos e aeroportos apontam para cidades/lugares que existem', async ({ app }) => {
    const problemas = await app.avaliar(() => {
      const out = [];
      Object.entries(TOP_PLACES).forEach(([k, nomes]) => {
        if (!CAT[k]) { out.push(`TOP_PLACES: cidade inexistente ${k}`); return; }
        nomes.forEach(t => { if (!CAT[k].places.some(p => p.name.startsWith(t))) out.push(`TOP_PLACES ${k}: nenhum lugar começa com "${t}"`); });
      });
      Object.keys(LEGS).forEach(key => {
        const [a, b] = key.split('|');
        if (!CAT[a] || !CAT[b]) out.push(`LEGS: cidade inexistente em ${key}`);
        if ([a, b].sort().join('|') !== key) out.push(`LEGS: chave fora de ordem ${key}`);
        if (!MODE[LEGS[key][0]]) out.push(`LEGS ${key}: meio de transporte desconhecido`);
      });
      Object.keys(GATEWAYS).forEach(k => { if (!CAT[k]) out.push(`GATEWAYS: cidade inexistente ${k}`); });
      return out;
    });
    expect(problemas).toEqual([]);
  });
});

// @ts-check
const path = require('path');
const { pathToFileURL } = require('url');
const { test: base, expect } = require('@playwright/test');

const APP_URL = pathToFileURL(path.join(__dirname, '..', 'roteiro-italia-2027.html')).href;
const HOJE = new Date('2026-10-31T12:00:00-03:00');

const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const diffDays = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

/** Roteiro vazio com datas fixas, no mesmo formato que o app salva no localStorage. */
function viagem({ titulo = 'Itália 2027', inicio = '2027-02-06', fim = '2027-02-23', ...extra } = {}) {
  const n = diffDays(inicio, fim) + 1;
  return {
    version: 1,
    title: titulo,
    settings: { tab: 'mapa', view: 'cal', hideDone: false, clFilter: 'all', travelers: 2, rooms: 1, eurUsd: 1.12, tourTax: 5, dailyExtra: 20, flightsUsd: 0 },
    days: Array.from({ length: n }, (_, i) => ({ id: 'd' + i, date: addDays(inicio, i), base: '', title: '', note: '', items: [] })),
    hotels: [], checklist: [], notes: '',
    plan: { cities: [], start: inicio, end: fim },
    ...extra,
  };
}

class App {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    /** Resposta dada aos confirm()/prompt() da página. */
    this.aceitarDialogos = true;
    /** @type {{tipo: string, mensagem: string}[]} */
    this.dialogos = [];
  }

  /** Abre o app. Com `estado`, o localStorage começa com esse roteiro (só na primeira carga da aba). */
  async abrir(estado) {
    if (estado) {
      await this.page.addInitScript(s => {
        if (sessionStorage.getItem('__semeado')) return;
        sessionStorage.setItem('__semeado', '1');
        localStorage.clear();
        localStorage.setItem('roteiro-v2:inicial', JSON.stringify(s));
        localStorage.setItem('roteiros-v2', JSON.stringify({ current: 'inicial', trips: [{ id: 'inicial' }] }));
      }, estado);
    }
    await this.page.goto(APP_URL);
    await expect(this.page.locator('#tab-mapa .map-modes')).toBeVisible();
  }

  async recarregar() {
    await this.page.reload();
    await expect(this.page.locator('#tab-mapa .map-modes')).toBeVisible();
  }

  /** Cópia do estado atual do app (variável global `state`). */
  estado() {
    return this.page.evaluate(() => JSON.parse(JSON.stringify(state)));
  }

  /** Executa uma função no contexto da página (tem acesso às funções globais do app). */
  avaliar(fn, arg) {
    return this.page.evaluate(fn, arg);
  }

  cidadeNoMapa(k) { return this.page.locator(`#tab-mapa .plan-svg .pl-city[data-city="${k}"]`); }
  paradas() { return this.page.locator('#tab-mapa .pl-stop'); }
  botao(acao) { return this.page.locator(`#tab-mapa [data-pl="${acao}"]`); }
  modal() { return this.page.locator('#modal'); }
  toast() { return this.page.locator('#syncToast'); }

  async modo(m) {
    await this.page.locator(`[data-mapmode="${m}"]`).click();
    await expect(this.page.locator(`[data-mapmode="${m}"]`)).toHaveClass(/\bon\b/);
  }

  /** Clica na cidade do mapa da Itália (chegada, saída ou abrir o painel da cidade). */
  async clicarNoMapa(k) {
    await this.cidadeNoMapa(k).dispatchEvent('click');
  }

  /** Escolhe chegada e saída pelo mapa. */
  async definirChegadaESaida(entrada, saida) {
    await this.clicarNoMapa(entrada);
    if (saida === entrada) await this.botao('same-exit').click();
    else await this.clicarNoMapa(saida);
    await expect(this.page.locator('#tab-mapa .pl-ends.done')).toBeVisible();
  }

  /** Inclui uma cidade na sequência pelo painel lateral. */
  async incluirCidade(k) {
    await this.page.locator(`#tab-mapa .pl-chip[data-city="${k}"]`).click();
    await this.page.locator(`#tab-mapa [data-pl="add-city"][data-city="${k}"]`).click();
    await expect(this.page.locator('#tab-mapa .pl-in')).toBeVisible();
    await this.botao('back').click();
  }

  async sequencia() {
    const s = await this.estado();
    return s.plan.cities.map(pc => `${pc.k}:${pc.n}`);
  }
}

// Filtros SVG (papel, traço "rabiscado") custam muito para pintar e não mudam comportamento.
const CSS_LEVE = 'svg [filter]{filter:none!important} html{scroll-behavior:auto!important}';

const test = base.extend({
  /** false nos testes visuais, que precisam do desenho completo. */
  modoLeve: [true, { option: true }],
  app: async ({ page, modoLeve }, use) => {
    if (modoLeve) {
      await page.addInitScript(css => {
        const opts = { behavior: 'auto' };
        const orig = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = function (arg) { return orig.call(this, typeof arg === 'object' ? { ...arg, ...opts } : arg); };
        const orig2 = window.scrollTo;
        window.scrollTo = function (...a) { return orig2.apply(this, typeof a[0] === 'object' ? [{ ...a[0], ...opts }] : a); };
        document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); });
      }, CSS_LEVE);
    }
    const erros = [];
    page.on('pageerror', e => erros.push(`erro na página: ${e.message}`));
    page.on('console', m => {
      if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) erros.push(`console.error: ${m.text()}`);
    });
    const app = new App(page);
    page.on('dialog', d => {
      app.dialogos.push({ tipo: d.type(), mensagem: d.message() });
      return app.aceitarDialogos ? d.accept() : d.dismiss();
    });
    // Sem rede: fontes do Google vazias e Wikipédia sem resultados, para os testes não dependerem da internet.
    await page.route(/^https?:\/\//, route => {
      const url = route.request().url();
      if (/fonts\.(googleapis|gstatic)\.com/.test(url)) return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
      if (/wiki(pedia|media)\.org/.test(url)) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"query":{"pages":{}}}' });
      return route.abort();
    });
    await page.clock.setFixedTime(HOJE);
    await use(app);
    expect(erros, 'a página não pode ter erros de JavaScript').toEqual([]);
  },
});

module.exports = { test, expect, viagem, addDays, diffDays, APP_URL, HOJE };

# Design System — Itália 2027

Definido a partir de `roteiro-italia-2027.html` (nov/2026). O app tem **dois temas**, com papéis diferentes:

| Tema | Onde | Ideia |
|---|---|---|
| **Caderno de viagem** | o app inteiro (planejador, mapas, cartões, homologação) | papel creme, contorno de tinta marrom e sombra de tinta sem desfoque, como um diário ilustrado |
| **Editorial** | páginas que abrem em nova aba (roteiro sugerido, linha do tempo), em `PAGE_CSS` | revista de viagem: fotos grandes, cartões brancos, sombras suaves, serifa elegante |

Os tokens do tema Caderno ficam num bloco único `:root` no início do `<style>`; os do Editorial ficam no `:root` de `PAGE_CSS`.

---

## 1. Princípios

1. **Papel e tinta.** Toda superfície é papel (`--paper`), todo contorno e sombra é tinta (`--ink`). Nada de preto puro nem cinza frio como cor principal.
2. **Sombra de tinta, não de luz.** Elementos interativos têm sombra deslocada e sem desfoque (`--sh-ink`). Ao passar o mouse, sobem 1 px e a sombra cresce 1 px.
3. **Cor quer dizer alguma coisa.** Cada cor de destaque tem um significado fixo: teal é ação, verde é "ok/no roteiro", laranja é aviso, vermelho é perigo, roxo é hotel/escolha, azul-marinho é voo/passagem.
4. **Mapa primeiro.** As telas giram em torno de mapas ilustrados; painéis laterais explicam e agem sobre o mapa.
5. **Texto claro em português.** Frases completas, números sempre com unidade, ações reversíveis com "Desfazer".

---

## 2. Cores

### 2.1 Papel e tinta (base)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#f5f3ee` | fundo da página |
| `--panel` | `#fff` | cartões neutros, calendário |
| `--paper` | `#fffaf0` | superfície padrão: cartões do planejador, botões, popovers, modais |
| `--paper2` | `#f7edd5` | moldura dos mapas (`.paper`) |
| `--paper3` | `#fffdf6` | cartões-postais, caixas claras |
| `--ink` | `#3b2a1e` | texto principal, contornos, sombras de tinta |
| `--ink-deep` | `#2b1d12` | títulos serifados (título do mapa, "Roteiros prontos") |
| `--ink-soft` | `#4a3b2a` | texto secundário escuro |
| `--muted-warm` | `#7a6a52` | texto de apoio no tema (legendas, dicas, rótulos) |
| `--muted-tan` | `#9a805c` | abas inativas, ícones discretos |
| `--muted` | `#6b7280` | texto de apoio neutro (`small`, `.muted`) |
| `--line` | `#e6e1d6` | divisória neutra |
| `--line-warm` | `#e4d3ae` | borda de botões claros (filtro de dias, camadas) |
| `--line-dash` | `#eadbb8` | separador tracejado de listas |
| `--line-strong` | `#d9c49a` | borda de caixas tracejadas e bilhetes |

### 2.2 Ação e estados

| Token | Valor | Significado | Fundo suave usado |
|---|---|---|---|
| `--accent` | `#0f766e` | ação primária, links, "Usar", "Adicionar" | `#eef8f5` / `#f0fdfa` |
| `--ok` | `#15803d` | concluído, "no roteiro", verificação OK | `#e7f6ec` / `#dcfce7` |
| `--warn` | `#c2410c` | atenção, "a reservar", dia cheio | `#fff1e6` / `#ffedd5` |
| `--danger` | `#b91c1c` | excluir, conflito, erro | `#fee2e2` |
| `--info` | `#1e3a8a` | voos e passagens | `#eef4fb` |
| `--pick` | `#7c3aed` | hotel, item escolhido, homologação | `#f1eafe` |
| `--highlight` | `#fde68a` | realce ao passar o mouse | — |

### 2.3 Itália

`--green #008c45` e `--red #cd212a`: faixa tricolor no topo (`.flag`) e detalhes de identidade. A tricolor é a assinatura visual: aparece no topo do app e das páginas.

### 2.4 Cores de dados (no JavaScript)

Estas cores vivem em constantes JS porque também pintam SVG (onde `var()` não funciona em atributos).

**Tipos de atividade** (`TYPES`): voo `#475569` · trem `#0e7490` · barco `#0369a1` · ônibus `#4d7c0f` · transfer `#64748b` · visita `#b45309` · passeio `#15803d` · comida `#be123c` · hotel `#7c3aed` · compras `#a21caf` · livre `#6b7280`.

**Meios de transporte entre cidades** (`MODE`): trem `#8a4b2a` · ônibus `#4d7c0f` · balsa `#1f78ad` · avião `#56657a` · carro `#b45309`. Traço da rota: trem `10 6`, avião `7 7`, balsa `2 6`.

**Cidades** (`CITY_COLORS` + `cityColor()`): Roma `#b91c1c`, Florença `#7e22ce`, Veneza `#0e7490`, Milão `#1d4ed8`, Nápoles `#0f766e`, Bolonha `#b45309`, Verona `#9d174d`, Pisa `#a16207`; as demais recebem `hsl(h 55% 38%)` calculado do nome (sempre a mesma cor para a mesma cidade).

**Dias** (`DAY_COLORS`): `#d1495b #00798c #e09f3e #4f7f3a #7b4fa0 #2e4057 #c05d2f #3a86ff`, em ordem, para pinos e trajetos de cada dia.

**Lojas** (`SHOP_KIND`): roupas e ruas de compras `#be185d`, eletrônicos `#1d4ed8`, outlet `#9d174d`. **Restaurantes**: `#c05d2f`.

### 2.5 Mapas ilustrados

| Elemento | Cor |
|---|---|
| Mar | gradiente radial `#c3e2ef` → `#8fc0d8` (`#seaGrad`); rótulos do mar `#2f6d8f`, Playfair/Lilita espaçada |
| Itália | `#f7e5bc`, costa `#7a5230` (2,5 px) |
| Europa vizinha | `#ebe0c6`, contorno `#b09466` |
| Suíça | `#f6d8cf`, fronteira tracejada `#c0504d` |
| Rios / lagos | `#7fb5d1` / `#8cc3dd` com borda `#4f8fb3` |
| Mapa da cidade (fundo) | `#f3e6c8`, colinas com `#hillGrad` |
| Textura | filtros `#rough` (borda tremida) e `#paperNoise` (grão de papel, 40–50% de opacidade) |

---

## 3. Tipografia

| Token | Família | Papel | Exemplos |
|---|---|---|---|
| `--font-display` | **Lilita One** | marca e ação: títulos de cartão, botões, abas, números | `.hero-title`, `.ink-btn`, `nav.tabs`, `.city-head h3` |
| `--font-serif` | **Playfair Display** 800 | título editorial e chamadas nobres | `.map-title`, "Roteiros prontos", páginas em nova aba |
| `--font-script` | **Caveat** | voz manuscrita: datas, subtítulos, estados vazios | `.map-sub`, `.f-script`, `.cl-empty` |
| `--font-hand` | **Patrick Hand** | rótulos de mapa e listas de cartão-postal | `.f-hand`, rótulos de cidades |
| `--font-body` | system-ui | todo o texto de leitura | corpo, listas, formulários |
| `--font-mono` | ui-monospace | dados técnicos (seletor CSS na homologação) | `.hm-sel` |

**Título com contorno de tinta** (assinatura do tema): Lilita One na cor da seção (`--c`), `-webkit-text-stroke: 1–1.5px var(--ink)`, `paint-order: stroke fill`, `text-shadow: 2px 2px 0 var(--ink)`, `letter-spacing: .03em`.

**Escala** (corpo base 14 px / 1,4):

| Passo | Tamanho | Uso |
|---|---|---|
| 2xs | 11 px | etiquetas em caixa alta, contadores |
| xs | 12 px | legendas, dicas, metadados |
| sm | 12,5–13 px | listas, chips, botões pequenos |
| base | 14 px | corpo |
| md | 15–17 px | títulos de cartão (h4/h3 de painel) |
| lg | 19–22 px | títulos de modal, subtítulos |
| xl | 24–28 px | título de seção (cartões do planejador, estadia) |
| hero | `clamp(30px, 4.5vw, 46px)` | título da cidade / aba |
| display | `clamp(34px, 5.2vw, 58px)` | título do mapa (Playfair, `letter-spacing .16em`) |

Caixa alta só em etiquetas curtas (`letter-spacing .05–.08em`).

---

## 4. Espaço, forma e profundidade

**Espaçamento** (passos de 2 px, mais usados: 6 e 8): `2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 24`. Padding de cartão `14px 16px`; de botão `5px 14px` (pequeno `3px 11px`).

**Raios**

| Token / valor | Uso |
|---|---|
| `--r-pill` (999px) | botões, chips, pílulas, filtros |
| `--radius` (14px) | cartões, stickers, popovers, painel de homologação |
| 18px | moldura do mapa (`.paper`) |
| 10–12px | caixas internas, bilhetes, cartões de resultado |
| 6–8px | miniaturas, etiquetas |
| 50% | medalhas, pinos, números de parada |

**Bordas**: `2px solid var(--ink)` em componentes principais; `1.5px solid var(--ink)` em secundários (chips, botão de minimizar); `1–1.5px solid var(--line-warm)` em controles claros; `1px dashed var(--line-dash)` entre itens de lista.

**Sombras**

| Token | Valor | Uso |
|---|---|---|
| `--sh-ink-sm` | 1.5px 1.5px 0 tinta | botão pequeno |
| `--sh-ink` | 2px 2px 0 tinta | botões, pílulas, bilhetes |
| `--sh-ink-md` | 3px 3px 0 tinta | cartões, stickers, medalhas |
| `--sh-ink-lg` | 4px 4px 0 tinta | popovers, hover card, homologação |
| `--sh-ink-xl` | 6px 6px 0 tinta | modais |
| `--shadow` | sombra suave dupla | cartões neutros e moldura do mapa |

**Camadas (z-index)**: cabeçalho fixo 20 · popover do mapa 20 · menus 30 · hover card 900 · menu Exportar 950 · aviso (toast) 1000 · homologação no topo de tudo.

**Movimento**: transições de 0,15 s (hover, hover card) e 0,25 s (aviso). Rota animada no mapa desliga com `prefers-reduced-motion`.

---

## 5. Ícones e ilustrações

- **Ícones de interface** (`IC`): 24×24, traço 2 px, pontas e junções arredondadas, `currentColor`. Inseridos com `icSvg(nome)` no app e `pic(nome)` nas páginas. Tamanhos: 12–13 px em linhas de texto, 15–16 px em botões, 26 px em miniaturas vazias.
- **Ilustrações de monumentos** (`#lm-*`, 100×100): medalhas de cidade, carimbos de cartão-postal e desenhos ao lado das atividades no mapa.
- Não usar emoji na interface; usar os ícones do conjunto.

---

## 6. Componentes

| Componente | Classe | Anatomia e regras |
|---|---|---|
| **Botão de tinta** | `.ink-btn` | pílula, papel, borda 2px tinta, `--sh-ink`, Lilita 14px. Variantes: `.primary` (fundo `--accent`, texto branco), `.danger` (texto `--danger`), `.small` (12,5px, `--sh-ink-sm`). Hover: sobe 1px, sombra `--sh-ink-md`. Desabilitado: opacidade .45. Um primário por grupo. |
| **Botão de ícone** | `.icon-btn` | sem borda, ícone 16px `--muted-tan`; hover com fundo `#f3e7c9`. |
| **Minimizar cartão** | `.card-min` | círculo 28px no canto do título, ▾/▸, `aria-expanded`. |
| **Pílulas (segmentado)** | `.pills` | grupo pílula com borda de tinta; opção ativa com fundo `--ink` e texto branco. |
| **Chip de estado** | `.st-chip.ok/.pick/.warn/.off` | pílula 11,5px negrito, borda na cor do estado, fundo suave do estado. |
| **Chip de cidade** | `.pl-chip` | pílula branca, borda 1,5px tinta; número da parada em círculo na cor da cidade. |
| **Cartão do planejador** | `.plan-side .card` | papel, borda 2px tinta, `--sh-ink-md`, raio 14; título Lilita 24px com contorno de tinta na cor da seção; botão de minimizar. |
| **Sticker** | `.sticker` | igual ao cartão, título Lilita 17px; pode ser `<details>` com +/–. |
| **Moldura de mapa** | `.paper` | papel `--paper2`, raio 18, borda dupla interna marrom (`#b88d55`), `--shadow`. |
| **Cartão-postal** | `.postcard` | `--paper3` pautado, leve rotação (`--rot`), carimbo ilustrado, título Caveat 32px na cor da cidade. |
| **Hover card** | `.hover-card` | 300px, papel, borda 2px, `--sh-ink-lg`, foto no topo, título Lilita 17px; some em telas de toque. |
| **Popover do mapa** | `.map-pop` | 270px, mesmo estilo do hover card, formulário de edição. |
| **Modal** | `dialog` | papel, borda 2px, `--sh-ink-xl`, título Lilita 22px; ações à direita, primária por último. |
| **Aviso com desfazer** | `.sync-toast` | fundo `--ink`, texto `--paper`, raio 14, centralizado embaixo; ações em botões dentro do aviso. Toda mudança relevante no roteiro mostra aviso com "Desfazer". |
| **Abas do painel** | `.cp-tabs` | texto 13px negrito `--muted-warm`, contador em `small`; ativa com sublinhado de 3px na cor da seção. |
| **Abas principais** | `nav.tabs` | Lilita 15px `--muted-tan`; ativa em tinta com sublinhado vermelho `#d93a2b`. |
| **Filtro de dias** | `.day-filter` | pílulas claras (borda `--line-warm`) em caixa alta; carga do dia `5h37/7h00` em `small`, vermelha quando passa do limite. |
| **Camadas do mapa** | `.layer-tgl` | pílulas pequenas com ícone; desligada fica esmaecida (`aria-pressed`). |
| **Seletor de noites** | `.ns` / `.ns-compact` | "− N +" com botões circulares de 26px (20px no compacto); desabilita nos limites com `title` explicando. |
| **Lista de opções** | `.hs-list` | linhas com ícone colorido (`--tc`), título negrito, `small` de apoio e botão `+` à direita; separador tracejado. |
| **Linha de verificação** | `.check-row.ok/.warn` | caixa com título em negrito e itens; verde para OK, vermelho-claro para avisos, com link para o item. |
| **Cartão de resultado** | `.ps-card` | miniatura 76px + nome, tipo, endereço/tempo, horário, links e "Adicionar". |
| **Roteiro pronto** | `.rs-item` | título, rota em pílulas coloridas com noites, resumo, linhas informativas (`.rs-time` deslocamento, `.rs-fly` passagens em azul) e ações; `.cur` com borda verde quando é o roteiro em uso. |
| **Bilhete** | `.ticket` | grade com ícone, data, descrição e preço separado por traço tracejado. |
| **Medalha** | `.medal-big` | círculo de papel com borda na cor da seção e `--sh-ink-md`, ilustração dentro. |
| **Cartão de escolha** | `.pick-card` | primeira tela do Checklist e do Orçamento ("em branco" × "preenchido"): faixa de 9px na cor da opção (`--c`), medalha de ícone 54px, título Lilita 27px com contorno, número grande, botão no rodapé; `.pk-badge` (post-it amarelo girado) marca a recomendada. |
| **Pacote** | `.pack-chip` | pílula branca com ícone em `.ic-dot`, nome em negrito e `small` com quanto acrescenta ("+8 itens"); `.done` esmaecido quando já está tudo na lista. |
| **Painel de documentos** | `.docs` / `.doc-card` / `.doc-row` | `<details>` com carimbo tracejado azul e bandeiras dos países do roteiro; cartões com cabeçalho cheio na cor do tema; cada linha tem ícone, explicação, fontes oficiais e `.tag` (`req` obrigatório, `rec` recomendado, `cond` condicional, `inf` saiba) + botão "+ checklist". Bandeiras em SVG (`flagSvg`), nunca emoji. |
| **KPI do orçamento** | `.bud-kpi` | cartão de papel com régua lateral de 7px e círculo translúcido na cor (`--c`); valor em Lilita com contorno; `.kbar` para progresso (listrado em vermelho quando passa do teto). |
| **Rosca do orçamento** | `donutSVG()` + `.dleg` | rosca de 190px com contorno de tinta e total no centro; legenda clicável leva à categoria. Cores das categorias em `BUD_CATS`. |
| **Item de orçamento** | `.bud-row` | duas linhas: marcador "pago" + título editável; valor, moeda (R$, €, US$, CHF), "total/por pessoa", selos `.est-chip` (estimativa) e `.paid-chip`, e o valor convertido à direita. |

---

## 7. Mapas

- **Marcadores por tipo**: cidade fora do roteiro = círculo branco com contorno de tinta; cidade no roteiro = pílula na cor da cidade com o número da parada; sugestão de lugar = círculo pontilhado com "+" (dourado nos mais visitados); hotel = quadrado roxo; restaurante = círculo com garfo `#c05d2f`; loja = círculo com sacola (rosa) ou celular (azul); rua de compras = pílula rosa cheia.
- **Rótulos**: Patrick Hand 10,5px (Lilita 13px quando a cidade está no roteiro), contorno de papel de 3–3,5px (`paint-order: stroke`). Nunca sobrepor outro rótulo; se não couber perto, ir mais longe com **linha-guia** (1px tinta, 55%) ou usar o nome curto.
- **Deslocamento de marcador**: se o espaço livre ficar longe do ponto real, ligar com linha pontilhada; se ficar longe demais, não desenhar (o item continua na lista do painel).
- **Rotas**: curva com traço por meio de transporte e ícone em círculo de papel no meio do trecho.

---

## 8. Tema Editorial (páginas em nova aba)

Definido em `PAGE_CSS`: `--ink #2b1d12`, `--paper #fbf6ec`, `--card #fff`, `--line #eadfca`, `--muted #7a6a55`, `--teal #0f766e`, `--gold #b7791f`.

- Fontes: **Inter** (texto 15,5px / 1,6) e **Playfair Display** (títulos 19–62px).
- Hero com até 3 fotos da Wikipédia, degradê escuro e chips translúcidos; faixa tricolor no topo.
- Cartões brancos com raio 18–22px e sombra suave (`0 6px 18px rgba(43,29,18,.05)`); caixas de destaque `.gold` (eventos), `.warn` (antes de fechar) e `.pass` (passagens).
- Linha do tempo com bolinha na cor da cidade e linha pontilhada; refeições do dia em `.meals`; sobra de tempo em `.spare`.
- Botão fixo "Imprimir / PDF"; estilos de impressão sem sombras.

---

## 9. Conteúdo e voz

- Português do Brasil, frases completas, tom de amigo que já viajou.
- Datas `dom 07/02`; horas `06:40`; duração `1h35` / `~38 min`; distância `650 m` / `2,8 km`; dinheiro `€70,01` e `US$ 1.000`.
- Estimativas sempre marcadas (`~`, "estimativa", "confira antes de comprar") e com fonte quando vierem de pesquisa.
- Botões com verbo: "Usar no meu roteiro", "Adicionar", "Escolher como hotel". Toda ação que muda o roteiro avisa o que mudou e oferece "Desfazer".
- Avisos dizem o problema e a saída: "passa de ~7h; mova um lugar para outro dia".

---

## 10. Acessibilidade

Já existe: `aria-pressed` em filtros e camadas, `role="tablist"`/`aria-selected` nas abas, `aria-expanded` no minimizar, `aria-label` em mapas e grupos, `title` explicando botões desabilitados, `prefers-reduced-motion` e hover card desligado em telas de toque. Contraste: `--accent` sobre papel ≈ 5,3:1 e `--muted-warm` sobre papel ≈ 5:1 (AA para texto normal).

---

## 11. Responsividade

Breakpoints em uso: 1280 · 1180 · 980 · 900 · 820 · 800 · 760 · 720 · 480 px. Comportamento-chave: em 980px o planejador e a cidade passam de 3 colunas (painel · mapa · painel) para 1 coluna com o mapa primeiro; grades de cartões usam `repeat(auto-fill, minmax(min(260px,100%),1fr))`.

---

## 12. Como usar e estender

1. **Use tokens, não valores.** Cor, fonte, sombra de tinta e raio de pílula novos devem vir de `var(--…)`. Se precisar de uma cor nova com significado, crie o token no `:root` e documente aqui.
2. **SVG gerado em JS** usa as constantes (`INK`, `TYPES`, `MODE`, `CITY_COLORS`, `SHOP_KIND`), porque atributos SVG não aceitam `var()`.
3. **Componente novo**: comece de um existente da seção 6 (cartão do planejador, lista de opções, botão de tinta) e mantenha borda de tinta, sombra de tinta e Lilita nos títulos.
4. **Página em nova aba**: use `openPage()` e as classes do tema Editorial.

---

## 13. Pendências encontradas

Para alinhar ao sistema aos poucos, sem mudança visual de uma vez:

- **Foco pelo teclado**: não há estilo `:focus-visible` e alguns campos removem o contorno (`outline:none`). Definir um anel de foco `2px var(--accent)` com afastamento.
- **Muitos tamanhos de fonte**: 22 valores diferentes (11,5 · 12,5 · 13,5 · 15,5…). Convergir para a escala da seção 3.
- **Duas cores de apoio**: `--muted` (cinza) e `--muted-warm` (marrom) convivem; no tema Caderno, preferir `--muted-warm`.
- **Pilhas de fonte do sistema**: há 5 variações de `system-ui…`; usar `var(--font-body)`.
- **Dois verde/vermelho da Itália**: `--green/--red` (topo do app) e `#1f9d55/#d93a2b` (páginas e aba ativa). Escolher um par.
- **Breakpoints**: 9 valores; consolidar em 1280 / 980 / 720 / 480.
- **Cores ainda fixas no CSS**: tons claros pontuais (fundos suaves de estado, `#f3e7c9`, `#b88d55`) podem virar tokens `--*-soft` quando forem reutilizados.

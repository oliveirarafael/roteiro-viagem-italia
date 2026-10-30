# Roteiro de viagem — modelo para preencher

Você é um planejador de viagens experiente. Monte o roteiro completo desta viagem e responda **somente com um bloco ```json** no formato da seção 4. A resposta será importada automaticamente num aplicativo, então siga o formato à risca.

## 1. Sobre a viagem
- Título: Itália + Suíça · Fevereiro 2027
- Período: 06/02/2027 a 23/02/2027 (18 dias)
- Viajantes: 2 · quartos de hotel: 1
- Voos já definidos (não alterar):
  - sáb 06/02/2027 15:35: Voo para Roma (Chegada D+1 às 06:40 (hora de Roma). Confirmar aeroporto de chegada (provavelmente Fiumicino – FCO).)
  - dom 07/02/2027 06:40–07:45: Chegada em Roma (FCO) + imigração (Imigração com EES: foto do rosto + 4 digitais na primeira entrada no Schengen. Pode demorar.)
  - ter 23/02/2027 22:30: Voo de volta ao Brasil (Saída de Roma Fiumicino (FCO).)
- Cidades de pernoite atuais: Roma (4 noites) → Florença (3 noites) → Veneza (3 noites) → Milão (6 noites)
- Moeda: o viajante usa dólar como moeda principal (câmbio ~US$ 1,12 por €), mas no JSON **todos os valores vão em euro**, que é o preço cobrado no local. O aplicativo converte.
- Preferências do viajante: [ESCREVA AQUI: ritmo, interesses, orçamento, restrições, o que não pode faltar]

## 2. O que fazer
- Um objeto por dia, cobrindo TODAS as datas do período, do dia do voo de ida ao dia do voo de volta.
- Inclua refeições sugeridas e momentos livres.
- Pesquise na internet horários, dias de fechamento, preços e necessidade de reserva para as datas da viagem. Se não tiver certeza, escreva "(conferir)" nas notas.
- Inclua os deslocamentos (trem, ônibus, barco, transfer) como atividades, com horário, preço e link de compra.
- Sugira de 2 a 4 hotéis por cidade de pernoite, com no máximo 1 marcado como escolhido.
- Monte um checklist de preparação (documentos, reservas e datas de abertura de vendas, hospedagem, carro se houver, dinheiro, saúde, bagagem), com link oficial em cada item sempre que existir.

## 3. Regras do formato
- Datas "AAAA-MM-DD"; horários "HH:MM" (24h). "fim" pode ser "" quando não fizer sentido.
- "dias" em ordem cronológica, sem pular datas.
- "cidade_pernoite": cidade onde se dorme naquela noite, sempre com a mesma grafia (ex.: sempre "Florença"). Use "Voo" quando a noite for dentro do avião e no dia do voo de volta.
- Bate-volta: a cidade_pernoite continua sendo a base; o destino aparece no título das atividades (ex.: "Trem Florença → Pisa").
- "tipo": "voo", "trem", "barco", "onibus", "transfer", "visita", "passeio", "comida", "hotel", "compras", "livre". (voo, trem, barco, onibus e transfer contam como transporte.)
- "custo_eur": número por pessoa, em euro, sem símbolo (0 se grátis).
- "reserva": "" (não precisa), "reservar" (comprar antes) ou "reservado" (já comprado).
- "link": site oficial ou de compra, começando com https:// — ou "".
- "local_mapa" (opcional): fixa o pino num ponto do mapa ilustrado. Use somente estas chaves:
  - Roma: `termini` (Estação Roma Termini), `vaticano` (Museus Vaticanos), `spietro` (Basílica de São Pedro), `coliseu` (Coliseu), `forum` (Fórum Romano), `pantheon` (Pantheon), `navona` (Piazza Navona), `campo` (Campo de' Fiori), `trevi` (Fontana di Trevi), `spagna` (Piazza di Spagna), `prati` (Prati), `santangelo` (Castel Sant'Angelo), `trastevere` (Trastevere), `campidoglio` (Campidoglio), `gueto` (Gueto Judaico), `argentina` (Largo Argentina / Vittoriano), `corso` (Via del Corso), `pincio` (Villa Borghese / Pincio), `borghese` (Galleria Borghese), `monti` (Monti)
  - Florença: `smn` (Estação Santa Maria Novella), `uffizi` (Galleria degli Uffizi), `signoria` (Piazza della Signoria), `pontevecchio` (Ponte Vecchio), `accademia` (Galleria dell’Accademia), `cupula` (Duomo e Cúpula), `batisterio` (Batistério e Campanile), `mercato` (Mercato Centrale), `vinaio` (All’Antico Vinaio), `pitti` (Palazzo Pitti / Boboli), `michelangelo` (Piazzale Michelangelo), `spirito` (Santo Spirito)
  - Veneza: `slucia` (Estação Santa Lucia), `campanile` (Campanile di San Marco), `smarco` (Basílica de São Marcos), `ducale` (Palácio Ducal), `rialto` (Ponte di Rialto), `canal` (Grande Canal), `bacaro` (Bacari perto do Rialto), `fnove` (Fondamente Nove), `salute` (Santa Maria della Salute), `gondola` (Gôndola), `cannaregio` (Cannaregio)
  - Milão: `centrale` (Milano Centrale), `duomo` (Duomo di Milano), `galleria` (Galleria Vittorio Emanuele II), `luini` (Luini), `cenacolo` (Cenacolo Vinciano), `sforzesco` (Castello Sforzesco), `brera` (Brera), `navigli` (Navigli), `quadrilatero` (Quadrilatero della Moda), `portanuova` (Porta Nuova), `eataly` (Eataly Smeraldo)
  Para outros lugares, omita o campo e escreva o nome do lugar no título. Também viram cartão-postal no mapa quando aparecem no título: Fiumicino, Malpensa, Via Ápia, Pisa, Lucca, Siena, Bolonha, Murano, Burano, Verona, Lago de Como, Bergamo, Tirano, St. Moritz, Lugano, Zermatt, Turim, Nápoles.
- Hotéis: "cidade" igual à cidade_pernoite; "preco_noite_eur" por quarto; "status" "sugestao", "reservado" ou "descartado".
- Checklist: "prazo" "AAAA-MM-DD" ou ""; "feito" true/false; "obrigatorio" true só para o que impede a viagem se faltar (documentos, reservas essenciais); "detalhes" explica o porquê e as regras; "links" lista sites oficiais com {"titulo", "url"}.
- Não crie campos novos, não escreva comentários dentro do JSON e não deixe vírgula sobrando.

## 4. Formato — exemplo com o começo da viagem; devolva o roteiro COMPLETO
```json
{
  "formato": "roteiro-viagem/1",
  "titulo": "Itália + Suíça · Fevereiro 2027",
  "viajantes": 2,
  "quartos": 1,
  "dias": [
    {
      "data": "2027-02-06",
      "cidade_pernoite": "Voo",
      "titulo": "Partida do Brasil",
      "observacao": "Itália está 4h à frente de Brasília em fevereiro. Tente dormir no voo para chegar com energia.",
      "atividades": [
        {
          "inicio": "12:30",
          "fim": "",
          "tipo": "transfer",
          "titulo": "Chegar ao aeroporto (3h antes)",
          "notas": "Check-in, despacho de bagagem e imigração de saída.",
          "custo_eur": 0,
          "reserva": "",
          "link": ""
        },
        {
          "inicio": "15:35",
          "fim": "",
          "tipo": "voo",
          "titulo": "Voo para Roma",
          "notas": "Chegada D+1 às 06:40 (hora de Roma). Confirmar aeroporto de chegada (provavelmente Fiumicino – FCO).",
          "custo_eur": 0,
          "reserva": "reservado",
          "link": ""
        }
      ]
    },
    {
      "data": "2027-02-07",
      "cidade_pernoite": "Roma",
      "titulo": "Chegada + centro histórico",
      "observacao": "1º domingo do mês: museus estatais grátis (Pantheon, Coliseu) — sem reserva, por ordem de chegada. Dia leve por causa do jet lag.",
      "atividades": [
        {
          "inicio": "06:40",
          "fim": "07:45",
          "tipo": "voo",
          "titulo": "Chegada em Roma (FCO) + imigração",
          "notas": "Imigração com EES: foto do rosto + 4 digitais na primeira entrada no Schengen. Pode demorar.",
          "custo_eur": 0,
          "reserva": "",
          "link": ""
        },
        {
          "inicio": "08:00",
          "fim": "08:32",
          "tipo": "trem",
          "titulo": "Leonardo Express: Fiumicino → Roma Termini",
          "notas": "Sem paradas, a cada 15 min. Pague por aproximação (cartão/celular) direto na catraca.",
          "custo_eur": 14,
          "reserva": "",
          "link": "https://www.trenitalia.com/it/regionale/collegamenti-regionale/leonardo-express.html"
        },
        {
          "inicio": "09:00",
          "fim": "",
          "tipo": "hotel",
          "titulo": "Deixar malas no hotel (Monti)",
          "notas": "Pedir early check-in com antecedência.",
          "custo_eur": 0,
          "reserva": "",
          "link": ""
        }
      ]
    }
  ],
  "hoteis": [
    {
      "cidade": "Roma",
      "nome": "Hotel Lancelot",
      "endereco": "Via Capo d’Africa 47 · perto do Coliseu",
      "preco_noite_eur": 170,
      "notas": "Familiar, um dos melhores custo-benefício de Roma. Café da manhã excelente, terraço. (~€160–240)",
      "escolhido": false,
      "status": "sugestao",
      "codigo_reserva": ""
    }
  ],
  "checklist": [
    {
      "categoria": "Documentos e entrada",
      "tarefa": "Passaporte válido até pelo menos 23/05/2027 (3 meses após a saída do Schengen) — ideal ter 6 meses e páginas em branco",
      "prazo": "2026-11-30",
      "link": "https://consportoalegre.esteri.it/pt/servizi-consolari-e-visti/servizi-per-il-cittadino-straniero/visti/visto-para-turismo-e-transito-ate-90-dias/",
      "feito": false,
      "obrigatorio": true,
      "detalhes": "Sem isso a companhia aérea não deixa embarcar. Se precisar renovar, o agendamento na Polícia Federal pode levar semanas.",
      "links": []
    }
  ],
  "anotacoes": ""
}
```

# Roteiro de viagem — modelo para preencher

Você é um planejador de viagens experiente. Monte o roteiro completo desta viagem e responda **somente com um bloco ```json** no formato da seção 4. A resposta será importada automaticamente num aplicativo, então siga o formato à risca.

## 1. Sobre a viagem
- Título: Minha viagem pela Itália
- Período: [ESCREVA AQUI as datas de ida e volta]
- Viajantes: 2 · quartos de hotel: 1
- Voos já definidos (não alterar):
  - (nenhum)
- Cidades de pernoite atuais: [ESCREVA AQUI: cidades que quer visitar, ou peça uma sugestão]
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
  "titulo": "Minha viagem pela Itália",
  "viajantes": 2,
  "quartos": 1,
  "dias": [
    {
      "data": "2027-05-01",
      "cidade_pernoite": "Roma",
      "titulo": "Roma antiga",
      "observacao": "",
      "atividades": [
        {
          "inicio": "09:00",
          "fim": "12:00",
          "tipo": "visita",
          "titulo": "Coliseu, Fórum Romano e Palatino",
          "notas": "Ingresso nominal com horário marcado.",
          "custo_eur": 18,
          "reserva": "reservar",
          "link": "https://ticketing.colosseo.it/",
          "local_mapa": "coliseu"
        },
        {
          "inicio": "12:30",
          "fim": "",
          "tipo": "comida",
          "titulo": "Almoço no bairro Monti",
          "notas": "",
          "custo_eur": 25,
          "reserva": "",
          "link": ""
        }
      ]
    }
  ],
  "hoteis": [
    {
      "cidade": "Roma",
      "nome": "Nome do hotel",
      "endereco": "Bairro",
      "preco_noite_eur": 150,
      "notas": "Por que vale a pena.",
      "escolhido": false,
      "status": "sugestao",
      "codigo_reserva": ""
    }
  ],
  "checklist": [
    {
      "categoria": "Documentos e entrada",
      "tarefa": "Passaporte válido por pelo menos 3 meses após a volta",
      "prazo": "",
      "link": "",
      "feito": false,
      "obrigatorio": true,
      "detalhes": "Exigência para entrar no espaço Schengen.",
      "links": []
    }
  ],
  "anotacoes": ""
}
```

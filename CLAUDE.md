# DOSE — instruções para o Claude Code

DOSE é um clube exclusivo de estilo de vida e treino ("Vida na dose."), entregue como PWA estático no GitHub Pages.
O dono é o Tiago. Fale com ele em português do Brasil, resposta primeiro e detalhes depois.

## Regras do Tiago (valem sempre)
- Não invente fatos, métricas, usuários, treinos, alimentos ou restaurantes. Ausente = "não informado".
- Separe fato verificado de hipótese. Código existir ≠ testado ≠ publicado.
- Ler → propor → esperar ok → aplicar, em tudo que for grande ou difícil de desfazer.
- Custo zero: nada de plano pago, API paga ou conta nova sem autorização dele.
- Nunca commitar segredos, senhas, chaves privadas ou dados pessoais (o repositório é público).
- Toda regra de treino ou nutrição precisa de fonte aberta e conferida; entra também em `window.SCIENCE`.

## Linguagem da marca (resumo; o completo está no Brand Book e na Plataforma Verbal)
- "Vida na dose." é a assinatura; "Tá na dose?" é a frase do membro. Inimigo: o excesso.
- O app é um clube por convite: a marca não se oferece, é pedida. Sem CTA de clique.
- Relação entre pessoas = "comunidade DOSE". "Grupo", nunca "turma".
- Comunidade fala só de treino. Não mencionar romance, nem para permitir nem para proibir.
- Sem promessa de corpo, sem antes e depois, sem "sem desculpas", "sua melhor versão", emoji como pontuação.
- "Vida na dose." vem antes de "A dose certa" (apoio). "A dose certa" fica (decisão do Tiago em 09/11/2026). Cortar "Registrado, não prometido." continua pendente.

## Arquitetura
- HTML + CSS + JS puros, sem build de framework. Estado global `S` em localStorage (`guia-treino-v1`).
- Navegação: `go(rota, params)` → `route()`; telas em `window.VIEWS` (V) e pós-render em `window.AFTER` (A).
- Muitos arquivos são IIFE: helpers que outros arquivos usam precisam ir para `window`.
- Novas funções entram em arquivo próprio que envolve a função antiga (`const _x=V.x; V.x=(p)=>...`).
- Ordem de carga em `index.html` importa: arquivo que envolve outro vem depois dele.
- Backend: Supabase (projeto `typfaauucqkztdhmbhqb`, plano grátis). A chave publicável fica no código; nenhuma outra.
- Strava e Saúde do iPhone desligados em 09/11/2026: funções `health-sync`, `strava-auth` e `strava-sync` respondem 410; código original em `supabase/arquivo-2026-11-09/`.
- Planos por esporte: `planos.js` (base) + `treino2.js` (Hyrox e corrida ampliados, ritmo VDOT, playlist).
- Motion: `motion2.js` (8 movimentos aprovados), `botoes.js` (animação por tipo de botão) e `motion3.js` (mapa dos músculos, ícones e medalhas). Regras no Brand Book §7.
- Telas aprovadas no DOSE Studio: `boasvindas.js` (Do excesso à dose) , `hoje2.js` (Hoje: medidor, ficha em leque, semana em barras) , `abertura.js` (abertura do dia para membros) , `dieta.js` (Minha dieta importada com check por refeição) , `mapa.js` (Pontos de treino do Rio, MapLibre + OpenFreeMap, aberto/fechado) , `comunidade2.js` (treino no ponto, presença confirmada, medalha Ponto), `dose.js` (a dose do dia: cartão por esporte e dados do relógio) , `clube.js` (Comunidade em Pontos, Grupos e Convites; convite numerado, cartão do encontro e cartão de membro; sem ranking da cidade) , `grupo6.js` (grupo de até 6 montado pelo app no ponto e horário escolhidos), `umtoque.js` (sessão em um toque, Segui a dieta hoje, o de sempre, refeição salva, esporte em um toque) , `primeira.js` (Primeira dose: convite se completa no primeiro treino juntos em 14 dias; medalhas Padrinho e Primeira dose) e `progressao.js` (progressão de carga animada na abertura do exercício; mostra a decisão do coach, nunca calcula diferente).
- `silencio.css` (luxo silencioso aprovado no Studio em 09/11): cards sem borda e com mais respiro, títulos de seção em caixa normal, abas em texto com traço embaixo, animações ~20% mais calmas. Cores e botões não mudaram.

## Publicar (skill `dose-deploy`)
1. Subir a versão: `?v=X` em todas as tags de `index.html` e `const C='dose-vX'` em `sw.js`. Arquivo novo entra na lista do `sw.js`.
2. `python3 build.py` (gera `dist/guia-treino.html`), `python3 tools/ds_build.py` (Overview) e `node tools/ds_components.js` (Components, precisa do Playwright).
3. Testar com Playwright (iPhone 15 Pro Max, fuso America/Sao_Paulo) e checar zero erros de página.
4. Commit em português com o que mudou, push em `main`; o GitHub Pages publica em ~1 min.
5. Conferir `https://tgovellinvest.github.io/dose/sw.js` com a versão nova.

## Design system
- Fonte única: `design-system/` (Overview = app real com dados de demonstração, isolado; Components depois da aprovação).
- Toda tela nova segue os tokens e componentes de lá. Não inventar cor, fonte ou componente fora dele.
- Grafite #0F1012, marfim #F4F2ED, ember #E4572E (um acento forte por tela), Archivo 900 nos títulos,
  Archivo Narrow nos números, Instrument Serif só em frase de manifesto. Sem gradiente colorido, glow ou 3D.

## Antes de uma funcionalidade nova
Use a skill `dose-grill-me`: perguntas em rodadas, cada uma com a resposta recomendada, até não sobrar decisão aberta.
Só então escreva a especificação curta e o código.

## Respostas
Seja direto e curto. Mostre o que mudou, o que foi testado e o que não foi.

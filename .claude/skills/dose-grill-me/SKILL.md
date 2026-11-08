---
name: dose-grill-me
description: Entrevistar o Tiago em rodadas antes de construir uma funcionalidade ou tela nova da DOSE, até não sobrar decisão em aberto.
---

# Entrevista antes de construir

Inspirada na prática de "grill me" (Matt Pocock), adaptada à DOSE.

1. Monte a árvore de decisões da funcionalidade: cada decisão abre as que dependem dela.
2. Em cada rodada, pergunte só o que já pode ser decidido (a "fronteira"), numerado, cada pergunta com a sua recomendação:

   **Q1. Título curto?** Contexto em uma ou duas frases.
   ➡️ Recomendação e o porquê em uma linha.

3. Fatos você busca sozinho (código, docs do projeto, web). Decisões são do Tiago: pergunte e espere.
4. Recalcule a fronteira depois de cada resposta. Pare quando não sobrar decisão aberta.
5. Escreva a especificação curta (o que entra, o que não entra, como testar) e só construa depois do ok.

Respeite as regras do `CLAUDE.md`: custo zero, nada inventado, linguagem da marca.

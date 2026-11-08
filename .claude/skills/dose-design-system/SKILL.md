---
name: dose-design-system
description: Manter e usar o design system vivo da DOSE (design-system/) e criar telas novas seguindo ele, com aprovação do Tiago em cada etapa.
---

# Design system da DOSE

Método inspirado no extract-ds (Rodrigo Tadewald): o design system nasce do app real, não de uma lista de cores.

## Estrutura
- `design-system/index.html`: catálogo com abas Overview e Components.
- `design-system/overview.html`: gerado por `tools/ds_build.py` a partir de `dist/guia-treino.html`.
  É o app real com dados de demonstração, armazenamento isolado (prefixo `dsdemo:`) e sem rede externa.
- Components: só depois da aprovação do Overview. Usa o HTML, as classes e o CSS reais do app,
  em grupos (Fundamentos: cores, tipografia, superfícies, bordas, motion; depois botões, chips, cards,
  medidor, barras, listas, sheets, formulários), cada um mostrando estado padrão, toque, foco e animação.

## Regras
- Aprovação em cada etapa: mostre, pergunte, pare.
- Não redesenhe ao documentar: copie o que existe.
- Tela nova: parta dos componentes do catálogo; se faltar um, proponha antes de criar.
- Recombinar referências (tipografia de uma, motion de outra) só com a escolha do Tiago.

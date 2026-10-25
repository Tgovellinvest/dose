# DOSE · guia de treino

App pessoal de treino (PWA estática) — PPL 2.0 + BJJ, Hyrox, corrida, boxe, futebol, natação, treino feminino, biblioteca de exercícios com vídeo, calculadora de nutrição conservadora, progresso com gráficos, exames e medalhas.

- Sem backend. Todos os dados pessoais ficam no `localStorage` do aparelho. **Nunca** commitar dados pessoais neste repositório.
- Hospedagem: GitHub Pages (pasta raiz). Instalar no iPhone: Safari → Compartilhar → Adicionar à Tela de Início.
- Conteúdo: `data/exercises.js` (biblioteca) e `data/programs.js` (programas, esportes, feminino, ciência, nutrição).
- Fonte de verdade do programa: vault TIAGO OS, `03 - Saúde/01 - Física/Projeto Casamento (Fit)`.

Build do preview único: `python3 build.py` → `dist/guia-treino.html`.

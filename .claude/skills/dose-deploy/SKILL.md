---
name: dose-deploy
description: Publicar uma nova versão do app DOSE no GitHub Pages com versão, build, design system, teste e conferência no site.
---

# Publicar a DOSE

1. Escolha a próxima versão (ex.: 6.9). Troque `?v=` em todas as tags de `index.html` e `const C='dose-v6.9'` em `sw.js`.
   Arquivo novo de JS ou CSS entra na lista `F` do `sw.js`.
2. Rode `python3 build.py` e depois `python3 tools/ds_build.py`.
3. Teste com Playwright no perfil iPhone 15 Pro Max e fuso `America/Sao_Paulo`:
   abra `index.html`, passe pelas telas mexidas, registre `pageerror` e confirme lista vazia.
4. `git add -A`, commit em português dizendo o que mudou, `git push` em `main`.
5. Espere o workflow "Deploy to GitHub Pages" terminar (`gh run list -L 1`).
6. Abra `https://tgovellinvest.github.io/dose/sw.js` e confira a versão nova.
7. Responda ao Tiago: o que mudou, o que foi testado, o que não foi (ex.: iPhone real).

Nunca publique segredo, senha ou dado pessoal. Nunca use `--force` no push.

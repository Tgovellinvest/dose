# DOSE — a dose certa

**App:** https://tgovellinvest.github.io/dose/ · PWA gratuita de treino, nutrição e progresso, baseada em 44 referências científicas listadas dentro do app (aba Ciência).

DOSE diz a dose certa de hoje, registra sem fricção e ajusta pela semana — sem motivação de outdoor, sem culpa, sem feed.

## O que o app faz
- **Hoje:** dose de hoje (0–100 com os motivos), mapa de recuperação por grupo muscular, sessão do dia, leitura do coach, semana.
- **Treino:** programas prontos e gerador pelo Método DOSE (7 objetivos, 5 níveis, 8 modos de equipamento), sessão guiada com série anterior pré-preenchida, RIR, timer adaptativo, check-in pós-sessão de 3 toques, 89 exercícios com vídeo e cues, modos de esporte (BJJ, Hyrox, corrida, boxe, futebol, natação), treino feminino.
- **Nutrição:** diário com ~90 alimentos, metas por calculadora conservadora, proteína por refeição, pesagem com média de 7 dias e ajuste semanal, suplementos (vale / limitado / não vale).
- **Progresso:** 11 gráficos, calendário mensal, check-in semanal, histórico, exames, medalhas em 9 famílias, platô por exercício, card da semana em PNG.
- **Conta (opcional):** e-mail e senha; sincroniza o mesmo JSON entre aparelhos. Sem conta, tudo fica só no aparelho.

## Stack
HTML/CSS/JS sem framework · Chart.js 4 · PWA (service worker network-first) · Supabase (Auth + Postgres com RLS, região São Paulo) · Google Analytics 4 · GitHub Pages com deploy automático (`.github/workflows/pages.yml`).

```
index.html  styles.css  app.js  views.js  views2.js  generator.js  coach.js  features.js  cloud.js  ads.js  sw.js
data/exercises.js  data/programs.js  data/foods.js     # conteúdo
brand/      # logo, ícones, tokens
email/      # templates de e-mail transacional (Supabase Auth)
termos.html privacidade.html legal.css                 # LGPD
build.py → dist/guia-treino.html                       # preview em arquivo único
```

## Regras do projeto
- Nunca commitar dados pessoais: o repositório é público; dados de usuário vivem no aparelho e, com conta, no Supabase.
- Toda regra do coach aponta para uma referência na aba Ciência com status "verificado" ou "a confirmar".
- Conteúdo educativo; não substitui médico, nutricionista ou profissional de educação física.

## Instalar no celular
iPhone: abrir o link no Safari → Compartilhar → Adicionar à Tela de Início. Android: Chrome → menu → Instalar app.

## Licença e marca
Código © 2026 Tiago Velloso. "DOSE" e o wordmark são marca do projeto; vídeos pertencem aos autores no YouTube; referências científicas aos seus periódicos.

Contato: tgo_abranches@hotmail.com · [Termos](https://tgovellinvest.github.io/dose/termos.html) · [Privacidade](https://tgovellinvest.github.io/dose/privacidade.html)

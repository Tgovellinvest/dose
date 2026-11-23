# Prompt para colar no Claude Code

Modelo: Sonnet 5.5 (o script já está pronto; troque para Opus 5.5 só se travar em erro difícil).
Pasta: a raiz do repositório DOSE no seu computador (Windows), por exemplo `C:\Users\Tiago\dose`.
Repositório: https://github.com/Tgovellinvest/dose (público, branch `main`).

Preparação (no terminal, antes de abrir o Claude Code):
PowerShell:
```
cd $HOME
git clone https://github.com/Tgovellinvest/dose.git   # se a pasta dose já existir: cd dose; git pull
cd dose
claude
```
Precisa de Node 20 ou mais novo (`node -v`). O seu computador tem Node 24, conferido.

Cole isto:

---
Leia o CLAUDE.md da raiz e siga as regras (português do Brasil, resposta primeiro, custo zero, nada inventado, fato verificado ≠ hipótese, nada de segredo nem foto pessoal no repositório público, ler → propor → esperar meu ok → aplicar).

Contexto: o DOSE ganhou a "Foto do prato" (v8.20 e v8.21). Hoje a foto é só referência na tela; a pessoa escolhe os alimentos. Quero saber se um modelo aberto, rodando no computador, consegue SUGERIR o alimento certo a partir da foto, entre os alimentos da base do DOSE. A pasta `tools/piloto/` já tem o script pronto (veja o README.md dela). Não mexa em nada fora de `tools/piloto/` e não altere o app.

Tarefa:
1. `cd tools/piloto && npm install`, depois `npm test`. Se algo falhar, mostre o erro e conserte só dentro de `tools/piloto/`.
2. Confirme a licença de cada modelo direto do Hugging Face (o script já imprime) e me diga qual é, sem supor. Se alguma for "other", pare e me mostre o texto dos termos em vez de seguir.
3. Eu vou colocar de 20 a 30 fotos de pratos em `tools/piloto/fotos/` e preencher `tools/piloto/verdade.csv`. Antes de rodar, confira o CSV e me diga o que estiver errado. Se ainda não houver fotos, pare e me avise; não invente fotos, nomes nem resultados.
4. Rode `npm run piloto -- --modelos Xenova/clip-vit-base-patch32,Xenova/clip-vit-base-patch16`.
5. Me entregue uma tabela curta por modelo: licença, MB dos arquivos ONNX, MB de cache, tempo de carga, tempo mediano por foto, top-1, top-3, top-5 (um alimento) e recall top-5 (vários), mais os 5 alimentos que mais erraram. Diga quantas fotos foram usadas e marque como "indicativo" se forem menos de 20.
6. Termine com: o que é fato medido, o que é hipótese, e o que eu preciso decidir. Critério que EU proponho (você não decide): vale integrar só como sugestão no app se o top-5 em fotos de um alimento for 80% ou mais com pelo menos 20 fotos, o modelo ficar abaixo de ~100 MB e a licença permitir uso comercial. Abaixo de 60% de top-5, não integrar.

Não faça commit de fotos, de `verdade.csv` nem de `resultado/` (já estão no .gitignore). Se for commitar algo, só código de `tools/piloto/`, em português, com o que mudou.
---

O que trazer de volta para o Claude do projeto: a tabela do passo 5 e o arquivo `tools/piloto/resultado/*.json`.

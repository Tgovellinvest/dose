# Prompt para colar no Claude Code (app desktop, aba Code)

Pasta a selecionar no app: `C:\Users\Tiago\Downloads\dose-piloto` (cópia pronta do repositório, sem git). Modelo: Sonnet 5.5.
Repositório de origem: https://github.com/Tgovellinvest/dose (público, branch `main`).

Cole isto:

---
Leia o CLAUDE.md da raiz e siga as regras (português do Brasil, resposta primeiro, custo zero, nada inventado, fato verificado ≠ hipótese, ler → propor → esperar meu ok → aplicar). Esta pasta é uma cópia sem git: não faça commit nem mexa em nada fora de `tools/piloto/`; não altere o app.

Contexto: o DOSE tem a "Foto do prato". Quero medir se um modelo aberto, rodando neste computador, SUGERE o alimento certo a partir da foto, entre os 45 alimentos de `tools/piloto/rotulos.json` (todos da base do DOSE). O script já está pronto (veja `tools/piloto/README.md`).

Faça nesta ordem:
1. `cd tools/piloto`, `npm install`, `npm test`. Se falhar, mostre o erro e conserte só dentro de `tools/piloto/`. Se o download dos pacotes ou do modelo for bloqueado por rede (erro de conexão ou 403), PARE e me mostre o erro; não tente contornar.
2. Veja as fotos em `tools/piloto/fotos/`. Se houver menos de 20, me avise quantas há e pare (não invente fotos nem resultados).
3. Não existe `verdade.csv`. Olhe cada foto e PROPONHA o arquivo (formato `arquivo;alimentos`, alimentos separados por `|`, só com nomes exatos de `rotulos.json`). Mostre a tabela arquivo → alimentos e ESPERE eu confirmar ou corrigir. O gabarito é o que eu confirmar, não o seu palpite. Alimento que não está na lista fica de fora, e me diga qual faltou.
4. Depois do meu ok, grave `verdade.csv` e rode `npm run piloto -- --modelos Xenova/clip-vit-base-patch32,Xenova/clip-vit-base-patch16`. Se alguma licença impressa for "other", pare e me mostre.
5. Me entregue por modelo uma tabela curta: licença, MB dos arquivos ONNX, MB de cache, tempo de carga, tempo mediano por foto, top-1, top-3, top-5 (um alimento), recall top-5 (vários) e os 5 alimentos que mais erraram. Diga quantas fotos usou e marque "indicativo" se forem menos de 20.
6. Termine com: o que é fato medido, o que é hipótese, e o que eu preciso decidir. Critério que EU proponho (você não decide): integrar só como sugestão no app se top-5 em fotos de um alimento for 80% ou mais, com pelo menos 20 fotos, modelo abaixo de ~100 MB e licença que permita uso comercial. Abaixo de 60% de top-5, não integrar.
---

Traga de volta para o Claude do projeto: a tabela do passo 5 e o arquivo `tools/piloto/resultado/*.json`.

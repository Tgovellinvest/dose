# Piloto: o CLIP sugere o alimento pela foto

Objetivo: medir se um modelo aberto, rodando no computador, acerta o alimento de uma foto de prato entre os alimentos da base do DOSE.
O app não muda por causa disto. Só decidimos depois de ver o resultado.

**Regras que valem aqui (CLAUDE.md):** custo zero, nada inventado, fato ≠ hipótese, nada de segredo nem foto pessoal no repositório (ele é público).

## Passo a passo
1. `cd tools/piloto && npm install` (baixa o transformers.js, Apache-2.0, conferido no npm)
2. `npm test` (testa só as métricas, sem modelo)
3. Coloque 20 a 30 fotos suas de pratos em `fotos/` (não vão para o git).
4. Copie `verdade.exemplo.csv` para `verdade.csv` e preencha: `arquivo;alimentos`, com os nomes **exatamente** como em `rotulos.json`, separados por `|`.
5. `npm run piloto` (compara o CLIP ViT-B/32, MIT) ou, para comparar mais modelos:
   `npm run piloto -- --modelos Xenova/clip-vit-base-patch32,Xenova/clip-vit-base-patch16`
6. O resultado fica em `resultado/*.json` (não vai para o git). Traga a tabela de volta para o Claude do projeto.

## O que o script mede
- Licença e tamanho dos arquivos ONNX, direto do Hugging Face (não de memória).
- Tempo de carga, tamanho do cache e tempo mediano por foto.
- Acerto top-1, top-3 e top-5 para fotos de um alimento; recall top-5 para pratos com vários.
- Os alimentos que mais erram.

## Limites
- 45 rótulos, não a base inteira (1.174 genéricos).
- Poucas fotos dão resultado só indicativo; o script avisa abaixo de 20.
- Modelo com licença "other" (como o MobileCLIP da Apple) exige ler os termos antes de qualquer uso no app.
- Isto só sugere o alimento. A porção continua sendo da pessoa; os macros, da tabela.

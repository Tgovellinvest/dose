import {metricas,porAlimento} from './metricas.mjs';
import assert from 'node:assert/strict';
const P=[
 {arquivo:'a',verdade:['A'],ranking:['A','B','C','D','E','F']},
 {arquivo:'b',verdade:['B'],ranking:['C','B','A','D','E','F']},
 {arquivo:'c',verdade:['C'],ranking:['D','E','F','A','B','C']},
 {arquivo:'d',verdade:['A','B'],ranking:['A','C','D','E','F','B']},
 {arquivo:'e',verdade:['A','B','C'],ranking:['C','A','B','D','E','F']}];
const m=metricas(P,5);
assert.equal(m.umAlimento,3); assert.equal(m.varios,2);
assert.equal(m.top1_umAlimento,0.333);      // só 'a'
assert.equal(m.top3_umAlimento,0.667);      // a e b
assert.equal(m.topK_umAlimento,0.667);      // c está na posição 6
assert.equal(m.recallK_varios,0.8);         // d: 1 de 2; e: 3 de 3 -> 4 de 5
assert.equal(m.recallK_todas,0.75);         // 6 acertos em 8 itens
console.log('metricas ok',JSON.stringify(m));
console.log(porAlimento(P,5));

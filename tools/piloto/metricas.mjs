// Métricas do piloto. Puras, para testar sem baixar modelo.
// previsoes: [{arquivo, verdade:[nomes], ranking:[nomes ordenados do mais ao menos provável]}]
export function metricas(previsoes,k=5){
  const unicos=previsoes.filter(p=>p.verdade.length===1), multi=previsoes.filter(p=>p.verdade.length>1);
  const acerta=(p,n)=>p.verdade.filter(v=>p.ranking.slice(0,n).includes(v)).length;
  const frac=(a,b)=>b?+(a/b).toFixed(3):null;
  return {
    fotos:previsoes.length, umAlimento:unicos.length, varios:multi.length,
    top1_umAlimento:frac(unicos.filter(p=>acerta(p,1)===1).length,unicos.length),
    top3_umAlimento:frac(unicos.filter(p=>acerta(p,3)===1).length,unicos.length),
    topK_umAlimento:frac(unicos.filter(p=>acerta(p,k)===1).length,unicos.length),
    recallK_varios:frac(multi.reduce((a,p)=>a+acerta(p,k),0),multi.reduce((a,p)=>a+p.verdade.length,0)),
    recallK_todas:frac(previsoes.reduce((a,p)=>a+acerta(p,k),0),previsoes.reduce((a,p)=>a+p.verdade.length,0)),
    k };
}
export function porAlimento(previsoes,k=5){ const m={};
  previsoes.forEach(p=>p.verdade.forEach(v=>{ const r=m[v]||(m[v]={n:0,noTopK:0}); r.n++; if(p.ranking.slice(0,k).includes(v)) r.noTopK++; }));
  return Object.entries(m).map(([n,r])=>({alimento:n,fotos:r.n,noTopK:r.noTopK})).sort((a,b)=>a.noTopK/a.fotos-b.noTopK/b.fotos); }

// ================= DOSE · v8.15 — medalhas de contribuição (ideia 6, aprovada pelo Tiago em 15/11/2026) =================
// Organizador: treinos que você marcou e tiveram presença confirmada. Grupo de 4: grupos seus que chegaram a 4 membros.
// Meta do grupo: grupos em que a meta coletiva foi batida (registrada quando você vê a barra completa).
// Sem ranking público; só aparece na sua lista de medalhas.
(function(){
const U=()=>window.CLOUD&&CLOUD.user();
const api=(p,o)=>window.GRUPOS.api(p,o);
const nivel=(v,t)=>v>=t[2]?3:v>=t[1]?2:v>=t[0]?1:0;

async function sinc(){ if(!U()||!window.GRUPOS) return; const id=U().id; let mud=false;
  try{ const r=await api(`treinos_abertos?criador=eq.${id}&select=id,treino_participantes(presente)&limit=500`); const n=(r||[]).filter(t=>(t.treino_participantes||[]).some(x=>x.presente)).length; if(S.organizados!==n){ S.organizados=n; mud=true; } }catch(e){}
  try{ const r=await api(`grupos?dono=eq.${id}&select=id,grupo_membros(user_id)&limit=100`); const n=(r||[]).filter(g=>(g.grupo_membros||[]).length>=4).length; if(S.gruposDe4!==n){ S.gruposDe4=n; mud=true; } }catch(e){}
  if(mud) save(); }

// meta coletiva batida: registra ao montar a barra completa
const _gc=window.gpColetiva; if(_gc) window.gpColetiva=function(det){ const h=_gc.apply(this,arguments); try{ const gid=det&&det.g&&det.g.id; if(gid&&/gn-col ok/.test(h||'')){ const m=S.metasGrupo||{}; if(!m[gid]){ m[gid]=today(); S.metasGrupo=m; save(); } } }catch(e){} return h; };

const _md=window.medalhas; if(_md) window.medalhas=function(){ const L=_md.apply(this,arguments);
  const o=S.organizados||0, to=[3,10,25]; L.push({cat:'Organizador',ico:'pin',nome:'Treinos marcados por você com presença confirmada',v:o,t:to,un:'treinos',tier:nivel(o,to),prox:to.find(x=>x>o)||null});
  const g=S.gruposDe4||0, tg=[1,3,5]; L.push({cat:'Grupo de 4',ico:'users',nome:'Grupos seus que chegaram a 4 pessoas',v:g,t:tg,un:'grupos',tier:nivel(g,tg),prox:tg.find(x=>x>g)||null});
  const m=Object.keys(S.metasGrupo||{}).length, tm=[1,3,10]; L.push({cat:'Meta do grupo',ico:'users',nome:'Grupos que bateram a meta coletiva',v:m,t:tm,un:'metas',tier:nivel(m,tm),prox:tm.find(x=>x>m)||null});
  return L; };

const _ac=window.AFTER&&AFTER.comunidade; if(window.AFTER) AFTER.comunidade=function(p){ const r=_ac?_ac.apply(this,arguments):null; sinc(); return r; };
setTimeout(sinc,6000);
})();

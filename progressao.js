// ================= DOSE · v8.3 — progressão de carga animada na abertura do exercício (aprovada pelo Tiago em 09/11/2026) =================
// Mostra por que a carga de hoje é essa. Regra do Método DOSE: reps dentro da faixa, depois carga.
// Referência: protótipo "dose_progressao_de_carga" (projeto Editor de Vídeos).
// Só mostra a decisão que o coach já toma (sugestaoCarga, app.js); nunca calcula diferente.
//  · subiu: todas as séries no topo → +2,5 kg ou +1 placa (mesmo incremento do "Fiz como da última vez", v8.2), reps voltam ao piso. Único ember.
//  · manteve: alguma série abaixo do topo → mesma carga, nada acende, "buscar +1 rep".
//  · campos: quando sobe, os campos de carga já vêm com a carga nova (ok do Tiago em 09/11).
//  · baixou: se a regra existente indicar carga menor, o número desce, sem ember, com a etiqueta da regra. Hoje sugestaoCarga não
//    dá número menor (ficou abaixo do piso → "ajuste para baixo ou mantenha"), então o número fica e a etiqueta é a da regra.
// Motion: cubic-bezier(.16,1,.3,1), sem loop, bounce, brilho ou confete. Não bloqueia; um toque pula para o fim; reduzir movimento = fim direto.
(function(){
const V=window.VIEWS, A=window.AFTER;
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=t=>1-Math.pow(1-t,4); // aproxima cubic-bezier(.16,1,.3,1) para os números
const fmt=v=>String(Math.round(v*10)/10).replace('.',',');
const faixaDe=r=>{ const [mn,mx]=String(r||'').replace(/\/.*$/,'').split(/[–-]/).map(x=>parseInt(x)); return {piso:mn||null,topo:mx||mn||null}; };

function ultimaSessao(ex){ for(let i=S.logs.length-1;i>=0;i--){ const l=S.logs[i]; const ss=(l.sets||[]).filter(x=>x.ex===ex&&x.done&&(x.reps||0)>0).sort((a,b)=>a.set-b.set); if(ss.length) return {data:l.data,sets:ss}; } return null; }

// decisão: a mesma do coach
function caso(ex,reps,un){ const sug=typeof sugestaoCarga==='function'?sugestaoCarga(ex,reps):null; const last=S.pesos[ex]; if(!sug||!last) return null;
  const ant=un==='placa'?last.placas:last.peso; if(ant==null) return null;
  let hoje=un==='placa'?(sug.placas??ant):(sug.peso??ant), tipo='manteve';
  if(sug.up){ tipo='subiu'; if(un!=='placa') hoje=Math.round((ant+2.5)*2)/2; }
  else if(hoje<ant) tipo='baixou';
  else if(sug.down) tipo='baixou';
  return {sug,ant,hoje,tipo}; }

function bloco(ex,reps,un,dia){ const ult=ultimaSessao(ex); if(!ult) return null; const c=caso(ex,reps,un); if(!c) return null;
  const {piso,topo}=faixaDe(reps); if(!topo) return null; const n=ult.sets.length; const abaixo=ult.sets.filter(x=>x.reps<topo);
  const unTxt=un==='placa'?'placas':'kg';
  const et=c.tipo==='subiu'?`de volta a ${piso||topo} reps`:c.tipo==='manteve'?'buscar +1 rep':c.sug.txt;
  const fr=c.tipo==='subiu'?`Bateu ${topo} nas ${n} séries. A carga sobe e as repetições voltam para ${piso||topo}.`
    :c.tipo==='manteve'?(abaixo.length===1?`Uma série ficou em ${abaixo[0].reps}. Mesma carga, e o alvo é mais uma repetição.`:`${abaixo.length} séries ficaram abaixo de ${topo} (${abaixo.map(x=>x.reps).join(', ')}). Mesma carga, e o alvo é mais uma repetição.`)
    :'';
  const marcaPiso=c.tipo==='subiu'&&piso&&piso<topo?`<b class="pg-piso" style="left:${piso/topo*100}%"></b>`:'';
  const barras=ult.sets.map((s,i)=>{ const r=Math.min(s.reps,topo); return `<div class="pg-b" data-r="${s.reps}" data-w="${r/topo*100}" data-top="${c.tipo==='subiu'&&s.reps>=topo?1:0}"><span class="pg-n">0</span><div class="pg-tr"><i class="pg-f"></i><b class="pg-top"></b>${marcaPiso}</div></div>`; }).join('');
  return `<div class="pg" data-ex="${ex}" data-tipo="${c.tipo}" data-ant="${c.ant}" data-hoje="${c.hoje}" role="group" aria-label="Por que a carga de hoje é ${fmt(c.hoje)} ${unTxt}">
    <div class="pg-eb"><span>Última sessão · ${fmtD?fmtD(ult.data):ult.data}</span><span>faixa ${piso&&piso!==topo?`${piso} a ${topo}`:topo} reps</span></div>
    <div class="pg-bars">${barras}</div>
    <div class="pg-carga"><span class="pg-lb">Carga de hoje</span><span class="pg-num"><b class="pg-v">${fmt(c.ant)}</b><span class="pg-un">${unTxt}</span></span><span class="pg-et">${esc(et)}</span></div>
    ${fr?`<p class="pg-fr">${esc(fr)}</p>`:''}</div>`; }

const _ses=V.sessao; V.sessao=(p)=>{ const h=_ses(p); const pr=programa(); const s=pr&&pr.sessoes[p.s]; if(!s) return h;
  const faixa={}; s.slots.forEach(sl=>{ faixa[resolveEx(sl.ex).id]=sl.reps; });
  const partes=h.split('<div class="card" id="ex_'); if(partes.length<2) return h;
  return partes[0]+partes.slice(1).map(ch=>{ const ex=ch.slice(0,ch.indexOf('"')); const un=typeof unDe==='function'?unDe(ex):'kg';
    const b=bloco(ex,faixa[ex],un); if(!b) return '<div class="card" id="ex_'+ch;
    let ch2=ch.replace(/<p class="small (?:up|down|muted)">[\s\S]*?<\/p>/,b);
    // ok do Tiago (09/11): quando o coach manda subir, os campos de carga já vêm com a carga nova (sem rascunho em andamento)
    const m=b.match(/data-tipo="(\w+)" data-ant="([\d.]+)" data-hoje="([\d.]+)"/); const temRasc=S._draft&&S._draft.sessao===p.s&&(S._draft.sets||[]).some(x=>x.ex===ex&&(x.done||x.peso!=null||x.placas!=null));
    if(m&&m[1]==='subiu'&&!temRasc){ const f=un==='placa'?'placas':'peso'; ch2=ch2.replace(new RegExp('value="'+m[2].replace('.','\\.')+'"( data-ex="'+ex+'" data-set="\\d+" data-f="'+f+'")','g'),'value="'+m[3]+'"$1'); }
    return '<div class="card" id="ex_'+ch2; }).join(''); };

// ---------- animação ----------
function contar(el,de,ate,dur,dec){ return new Promise(ok=>{ const t0=performance.now(); const f=t=>{ const k=Math.min(1,(t-t0)/dur); const v=de+(ate-de)*ease(k); el.textContent=dec?fmt(k<1?Math.round(v*2)/2:v):String(Math.round(v)); if(k<1) el._raf=requestAnimationFrame(f); else ok(); }; el._raf=requestAnimationFrame(f); }); }
function fim(pg){ if(pg._fim) return; pg._fim=true; (pg._timers||[]).forEach(clearTimeout); pg.querySelectorAll('.pg-n,.pg-v').forEach(e=>cancelAnimationFrame(e._raf));
  pg.classList.add('pg-sem','pg-fim'); pg.querySelectorAll('.pg-b').forEach(b=>{ b.querySelector('.pg-n').textContent=b.dataset.r; b.querySelector('.pg-f').style.width=b.dataset.w+'%'; if(b.dataset.top==='1') b.classList.add('on'); });
  pg.querySelector('.pg-v').textContent=fmt(+pg.dataset.hoje); if(pg.dataset.tipo==='subiu') pg.classList.add('pg-sobe'); }
function tocar(pg){ if(pg._ini) return; pg._ini=true; if(reduz()){ fim(pg); return; }
  const T=(fn,ms)=>{ (pg._timers=pg._timers||[]).push(setTimeout(()=>{ if(!pg._fim) fn(); },ms)); };
  const bs=[...pg.querySelectorAll('.pg-b')]; const D=1100, G=90;
  bs.forEach((b,i)=>T(()=>{ b.querySelector('.pg-f').style.width=b.dataset.w+'%'; contar(b.querySelector('.pg-n'),0,+b.dataset.r,D).then(()=>{ if(b.dataset.top==='1'&&!pg._fim) b.classList.add('on'); }); },i*G));
  const tCarga=(bs.length-1)*G+D+180; const ant=+pg.dataset.ant, hoje=+pg.dataset.hoje;
  T(()=>{ pg.classList.add('pg-c'); if(hoje!==ant){ if(pg.dataset.tipo==='subiu') pg.classList.add('pg-sobe'); pg.classList.add('pg-mov'); contar(pg.querySelector('.pg-v'),ant,hoje,900,true).then(()=>pg.classList.remove('pg-mov')); } },tCarga);
  T(()=>{ pg.classList.add('pg-fim'); },3600);
  T(()=>{ pg._fim=true; },3600+700); }
const _as=A.sessao; A.sessao=(p)=>{ const r=_as?_as(p):null; const pgs=document.querySelectorAll('#view .pg'); if(!pgs.length) return r;
  pgs.forEach(pg=>pg.addEventListener('click',()=>fim(pg)));
  if(!('IntersectionObserver' in window)){ pgs.forEach(tocar); return r; }
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ tocar(e.target); io.unobserve(e.target); } }),{threshold:.45}); pgs.forEach(pg=>io.observe(pg)); return r; };
})();

// ================= DOSE · v8.7 — volume da semana e deload no check-in semanal (aprovado pelo Tiago em 09/11/2026) =================
// Mostra por que a próxima semana é (ou não é) de deload. Referência: protótipo "dose_volume_semana_deload" (projeto Editor de Vídeos).
// A decisão vem de leituraSemana() (coach.js): gatilho = e1RM (Epley) caindo mais de 3% em 2 sessões seguidas; calendário = 6 ou mais
// das últimas 8 semanas com treino e nenhum check-in de deload. O app NÃO calcula volume nem carga da semana de deload, então a
// próxima semana não ganha altura inventada: entra o selo "deload" com as faixas da regra (mesma decisão da progressão de carga).
// Sem deload: a barra entra na altura do plano (séries das próximas sessões da rotação, uma por dia de musculação do perfil).
// Motion: cubic-bezier(.16,1,.3,1); linha em easeInOutCubic 1,2 s; sem loop, bounce, brilho ou confete. Um toque pula para o fim.
(function(){
const V=window.VIEWS;
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const eOut=t=>1-Math.pow(1-t,4);
const semIni=off=>{ const x=new Date(); x.setDate(x.getDate()-((x.getDay()+6)%7)-7*off); return x.ymd(); };
const pct=v=>String(Math.round(Math.abs(v)*10)/10).replace('.',',');
const NS=6;

function e1rm(ex){ const by={}; S.logs.forEach(l=>(l.sets||[]).forEach(s=>{ if(s.ex===ex&&s.done&&s.peso){ const v=s.peso*(1+(s.reps||0)/30); by[l.data]=Math.max(by[l.data]||0,v); } })); return Object.keys(by).sort().map(d=>({d,v:by[d]})); }
function dados(){ const L=window.leituraSemana?leituraSemana():[]; const gat=L.find(x=>x.t==='Queda de performance em 2 sessões'); const cal=L.find(x=>x.t==='Seis ou mais semanas sem deload');
  // séries feitas por semana (as últimas 6, da mais antiga para a atual)
  const sem=[...Array(NS)].map((_,i)=>{ const off=NS-1-i, a=semIni(off), b=semIni(off-1); return S.logs.filter(l=>l.data>=a&&l.data<b).reduce((n,l)=>n+(l.sets||[]).filter(s=>s.done).length,0); });
  // exercício: o que disparou o gatilho; senão o composto principal (primeiro exercício da primeira sessão da ficha)
  let ex=null, porque='composto principal'; if(gat){ const nomes=gat.d.split('.')[0].split(',').map(x=>x.trim()); ex=Object.keys(S.pesos).find(k=>EX[k]&&EX[k].nome===nomes[0])||null; if(ex) porque='gatilho'; }
  if(!ex){ try{ const pr=programa(); const s0=pr.sessoes[Object.keys(pr.sessoes)[0]]; ex=resolveEx(s0.slots[0].ex).id; }catch(e){} }
  const serie=ex?e1rm(ex).slice(-6):[];
  // plano da próxima semana
  let plano=null; try{ const pr=programa(); const ids=Object.keys(pr.sessoes); const k=(S.perfil.diasMusc||[]).length; if(k&&ids.length){ let i=Math.max(0,ids.indexOf(proximaSessaoId())); plano=0; for(let j=0;j<k;j++){ plano+=pr.sessoes[ids[(i+j)%ids.length]].slots.reduce((n,sl)=>n+(sl.sets||0),0); } } }catch(e){}
  const semTreino=[0,1,2,3,4,5,6,7].filter(k=>{ const a=semIni(k), b=semIni(k-1); return S.logs.some(l=>l.data>=a&&l.data<b); }).length;
  const tipo=gat?'gatilho':cal?'calendario':serie.length<3?'pouco':'segue';
  return {tipo,sem,ex,porque,serie,plano,semTreino}; }

function bloco(D){ const {tipo,sem,ex,porque,serie,plano}=D; const max=Math.max(1,...sem,plano||0);
  const bar=(v,cls,lab)=>`<div class="vd-b ${cls}"><span class="vd-n" data-v="${v}">0</span><i style="--h:${Math.round(v/max*100)}%"></i><small>${lab}</small></div>`;
  const labs=[...Array(NS)].map((_,i)=>i===NS-1?'esta':`−${NS-1-i}`);
  const prox=tipo==='gatilho'||tipo==='calendario'?`<div class="vd-b vd-prox vd-dl"><span class="vd-selo">deload</span><small>próxima</small></div>`
    :plano?bar(plano,'vd-prox vd-pl','próxima'):`<div class="vd-b vd-prox"><span class="vd-selo vd-s2">plano</span><small>próxima</small></div>`;
  // linha da força
  let linha=''; if(serie.length>=2){ const W=300,H=86,P=10; const vs=serie.map(x=>x.v); const mn=Math.min(...vs), mx=Math.max(...vs); const y=v=>mx===mn?H/2:H-P-(v-mn)/(mx-mn)*(H-2*P); const x=i=>P+i*(W-2*P)/(serie.length-1);
    const pts=serie.map((s,i)=>`${x(i).toFixed(1)},${y(s.v).toFixed(1)}`).join(' ');
    const dots=serie.map((s,i)=>{ const q=i>0?(s.v-serie[i-1].v)/serie[i-1].v*100:0; const cai=i>0&&q<-3&&tipo==='gatilho'&&i>=serie.length-2; return `<g class="vd-pt ${cai?'cai':''}" data-i="${i}"><circle cx="${x(i).toFixed(1)}" cy="${y(s.v).toFixed(1)}" r="3.5"/>${cai?`<text x="${x(i).toFixed(1)}" y="${(y(s.v)+16).toFixed(1)}" text-anchor="middle">−${pct(q)}%</text>`:''}</g>`; }).join('');
    linha=`<div class="vd-forca"><div class="vd-lb">Força estimada · ${esc(EX[ex]?EX[ex].nome:'—')}${porque==='composto principal'?' (composto principal)':''}</div><svg viewBox="0 0 ${W} ${H+14}"><polyline points="${pts}" pathLength="1"/>${dots}</svg></div>`; }
  const regra=tipo==='gatilho'?'volume −40 a 50%, carga −10 a 15%, RIR 3 a 4':tipo==='calendario'?'cerca de 50% das séries, carga mantida ou −10 a 20%':'';
  const fr=tipo==='gatilho'?`A força caiu duas sessões seguidas, mais de 3% cada. A próxima semana é de deload: ${regra}.`
    :tipo==='calendario'?`Faz ${D.semTreino} semanas de treino. A próxima é de deload, pelo calendário.`
    :tipo==='pouco'?'Ainda tem pouco histórico para ler a força. A próxima semana segue o plano.'
    :'Força subindo e sem sinal de fadiga. A próxima semana segue o plano.';
  return `<div class="vd" data-tipo="${tipo}" role="group" aria-label="Volume da semana e deload"><div class="eyebrow" style="text-align:left">Séries por semana</div>
   <div class="vd-bars">${sem.map((v,i)=>bar(v,'vd-h',labs[i])).join('')}${prox}</div>
   ${linha}${regra?`<p class="vd-regra">${regra}</p>`:''}<p class="vd-fr">${fr}</p></div>`; }

const _c=V._checkin; V._checkin=(...a)=>{ const h=_c(...a); let b=''; try{ b=bloco(dados()); }catch(e){ return h; } setTimeout(iniciar,30); return b+h; };

// ---------- animação ----------
function contar(el,ate,dur){ const t0=performance.now(); const f=t=>{ const k=Math.min(1,(t-t0)/dur); el.textContent=Math.round(ate*eOut(k)); if(k<1) el._raf=requestAnimationFrame(f); }; el._raf=requestAnimationFrame(f); }
function fim(a){ if(a._fim) return; a._fim=true; (a._t||[]).forEach(clearTimeout); a.querySelectorAll('.vd-n').forEach(n=>{ n._raf&&cancelAnimationFrame(n._raf); n.textContent=n.dataset.v; });
  a.classList.add('vd-sem','on-l','on-q','on-p','on-fr'); a.querySelectorAll('.vd-b,.vd-pt').forEach(x=>x.classList.add('on')); }
function tocar(a){ if(a._ini) return; a._ini=true; a.addEventListener('click',()=>fim(a)); if(reduz()){ fim(a); return; }
  const T=(fn,ms)=>{ (a._t=a._t||[]).push(setTimeout(()=>{ if(!a._fim) fn(); },ms)); };
  const bs=[...a.querySelectorAll('.vd-h')]; bs.forEach((b,i)=>T(()=>{ b.classList.add('on'); contar(b.querySelector('.vd-n'),+b.querySelector('.vd-n').dataset.v,800); },i*70));
  let t=(bs.length-1)*70+800+150; const pts=[...a.querySelectorAll('.vd-pt')];
  if(pts.length){ T(()=>a.classList.add('on-l'),t); pts.forEach((p,i)=>T(()=>p.classList.add('on'),t+i*(1200/Math.max(1,pts.length-1)))); t+=1200+150; T(()=>a.classList.add('on-q'),t); t+=450; }
  T(()=>{ a.classList.add('on-p'); const p=a.querySelector('.vd-prox'); p.classList.add('on'); const n=p.querySelector('.vd-n'); if(n) contar(n,+n.dataset.v,800); },t);
  T(()=>a.classList.add('on-fr'),Math.max(t+500,3600)); T(()=>{ a._fim=true; },Math.max(t+500,3600)+600); }
function iniciar(){ const a=document.querySelector('#view .vd'); if(!a) return; if(!('IntersectionObserver' in window)){ tocar(a); return; } const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ tocar(a); io.disconnect(); } }),{threshold:.35}); io.observe(a); }
})();

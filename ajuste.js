// ================= DOSE · v8.5 — ajuste semanal da dieta animado (aprovado pelo Tiago em 09/11/2026) =================
// Mostra por que a meta de calorias mudou ou não mudou. Referência: protótipo "dose_ajuste_semanal_dieta" (projeto Editor de Vídeos).
// Sem lógica nova: a decisão vem de ajusteSemanal() (views2.js, regra "Ajuste semanal (coach)") e os números de ajusteDados(),
// que repete as mesmas contas. Cut: perde >1,2% → +150; perde <0,25% (ou ganha) → −150 ou 2×20 min de Z2; 0,25–1,2% mantém.
// Bulk: ganha >0,6% → −150; <0,1% → +150; senão mantém.
// Motion: cubic-bezier(.16,1,.3,1), marcador em easeInOutCubic 1,1 s, sem loop, bounce, brilho ou confete. Um toque pula para o fim.
(function(){
const V=window.VIEWS;
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const eOut=t=>1-Math.pow(1-t,4), eIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const f1=v=>(Math.round(v*10)/10).toFixed(1).replace('.',',');
const pctTxt=v=>String(Math.round(Math.abs(v)*10)/10).replace('.',',');
const kTxt=v=>String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');

function caso(){ const aj=window.ajusteSemanal?ajusteSemanal():null; const D=window.ajusteDados?ajusteDados():null; if(!D) return null;
  let tipo='mantem', delta=0;
  if(!aj||aj.t==='Diário com poucos dias') tipo='poucos';
  else if(aj.t==='Perdendo mais de 1% por semana'||aj.t==='Peso parado em superávit'){ tipo='muda'; delta=150; }
  else if(aj.t==='Ganhando rápido demais'){ tipo='muda'; delta=-150; }
  else if(aj.t==='Peso travado duas semanas'){ const esc=(S.ajusteEsc||{})[semanaIni()]; if(esc==='z2') tipo='z2'; else { tipo='muda'; delta=-150; } }
  const ap=(S.ajusteAplicado||{})[semanaIni()]; if(ap&&tipo==='muda'){ tipo='aplicada'; delta=ap.delta; }
  const bulk=/^bulk/.test(D.ob), manut=!bulk&&!(/^cut/.test(D.ob)||D.ob==='recomp');
  return {aj,D,tipo,delta,bulk,manut,travado:aj&&aj.t==='Peso travado duas semanas'}; }

function frase(c){ const {D,tipo,delta,bulk}=c; if(tipo==='poucos') return 'Ainda não ajusto: preciso de 4 dias de diário e 10 pesagens em 2 semanas.';
  const p=D.pct; const verbo=p<0?'Perdeu':'Ganhou'; const base=`${verbo} ${pctTxt(p)}% na semana`;
  if(c.manut) return `${base}. Dentro do esperado para manter. A meta fica como está.`;
  if(tipo==='aplicada') return `${base}. A meta ${delta>0?'subiu':'desceu'} ${Math.abs(delta)} kcal nesta semana e já está valendo.`;
  if(tipo==='z2') return `${base}, abaixo de 0,25%. Em vez de cortar calorias, entram 2×20 min de Z2. A meta fica como está.`;
  if(tipo==='muda'){ if(bulk) return delta<0?`${base}, acima de 0,6%. A meta desce 150 kcal.`:`${base}, abaixo de 0,1%. A meta sobe 150 kcal.`;
    return delta>0?`${base}, mais rápido que 1,2%. A meta sobe 150 kcal para proteger a massa magra.`:`${base}, abaixo de 0,25%. A meta desce 150 kcal.`; }
  const v=bulk?p:-p; const dentro=bulk?(v>=0.1&&v<=0.5):(v>=0.5&&v<=1); return `${base}, ${dentro?'dentro da faixa':'perto da faixa'}. A meta fica como está.`; }

function regua(c){ const MAX=1.6; const b=c.bulk; const faixa=c.manut?null:b?[0.1,0.5]:[0.5,1]; const marcas=b?[0.1,0.25,0.5,0.6]:[0.25,0.5,1,1.2];
  const v=c.D.pct==null?0:(b?c.D.pct:c.manut?Math.abs(c.D.pct):-c.D.pct); const pos=Math.max(0,Math.min(MAX,v))/MAX*100; const P=x=>x/MAX*100;
  return `<div class="aj-regua" data-pos="${pos}"><div class="aj-rt">${faixa?`<span class="aj-fx" style="left:${P(faixa[0])}%;width:${P(faixa[1]-faixa[0])}%"><i>faixa · mantém</i></span>`:''}${marcas.map(m=>`<b class="aj-mk" style="left:${P(m)}%"><i>${String(m).replace('.',',')}</i></b>`).join('')}<span class="aj-mr" style="left:0%"><i>${v<0?'+':''}${pctTxt(v)}%</i></span></div>
   <div class="aj-rl"><span>0</span><span>${b?'ganho':'perda'} por semana, % do peso</span><span>1,6</span></div></div>`; }

function bloco(c){ const {D,tipo,delta}=c; const ok=(b,t)=>`<div class="aj-cd ${b?'ok':'pd'}"><i aria-hidden="true">${b?'✓':'·'}</i><span>${t}</span></div>`;
  const meta=D.meta; const nova=meta!=null?meta+delta:null; const et=tipo==='aplicada'?`aplicada · ${delta>0?'+':'−'}${Math.abs(delta)} kcal`:tipo==='muda'?`${delta>0?'+':'−'}${Math.abs(delta)} kcal`:tipo==='z2'?'+2×20 min Z2':'mantém';
  return `<div class="aj" data-tipo="${tipo}" data-de="${meta||0}" data-para="${nova||0}" role="group" aria-label="Ajuste semanal da meta">
   <div class="eyebrow" style="text-align:left">Ajuste semanal</div>
   <div class="aj-cds">${ok(D.regOk,`${Math.min(D.reg,4)} de 4 dias de diário`)}${ok(D.pesOk,`${Math.min(D.nPes14,10)} de 10 pesagens`)}</div>
   ${tipo==='poucos'?'':`<div class="aj-ms"><div class="aj-m"><span>Média semana passada</span><b data-v="${D.m1}">0,0</b><small>kg</small></div><div class="aj-m"><span>Média desta semana</span><b data-v="${D.m0}">0,0</b><small>kg</small></div></div>
   ${regua(c)}
   <div class="aj-meta"><span class="aj-lb">${tipo==='muda'?'Meta sugerida':'Meta de calorias'}</span><span class="aj-num"><b class="aj-v">${meta?kTxt(meta):'—'}</b><small>kcal</small></span><span class="aj-et">${et}</span></div>
   ${c.travado?`<button class="lk aj-troca" onclick="event.stopPropagation();ajTroca()">${tipo==='z2'?'Prefiro cortar 150 kcal':'Prefiro 2×20 min de Z2 em vez de cortar'}</button>`:''}`}
   <p class="aj-fr">${frase(c)}</p>${tipo==='muda'&&meta?`<button class="btn sec aj-ap" onclick="event.stopPropagation();ajAplicar(${delta})">Aplicar a nova meta: ${kTxt(nova)} kcal</button>`:''}</div>`; }

// ok do Tiago (09/11): a meta sugerida só vale depois de "Aplicar". O ajuste mexe no carboidrato (≈4 kcal por grama), como o coach indica.
window.ajAplicar=(delta)=>{ const pc=S.perfil.protocoloCoach; let base=null; if(pc&&pc.kcal) base=Object.assign({},pc); else { const n=typeof calcNutri==='function'?calcNutri(S.perfil):null; if(n) base={kcal:n.alvo,p:n.prot,c:n.carb,g:n.gord}; }
  if(!base) return toast('Defina a meta em Nutrição › Metas primeiro'); const de=base.kcal;
  S.perfil.protocoloCoach=Object.assign(base,{kcal:de+delta,c:Math.max(0,Math.round((base.c||0)+delta/4)),fonte:'ajuste semanal'});
  S.ajusteAplicado=S.ajusteAplicado||{}; S.ajusteAplicado[semanaIni()]={de,para:de+delta,delta}; save(); toast(`Meta agora em ${kTxt(de+delta)} kcal`); route(); };
window.ajTroca=()=>{ S.ajusteEsc=S.ajusteEsc||{}; const k=semanaIni(); S.ajusteEsc[k]=S.ajusteEsc[k]==='z2'?'kcal':'z2'; save(); route(); };

const _p=V._peso; V._peso=(...a)=>{ const h=_p(...a); const c=caso(); if(!c) return h;
  const re=/<div class="item" style="border-left:3px solid var\(--(?:warn|ok|bone)\);margin:10px 0">[\s\S]*?<\/div><\/div>|<p class="tiny">Com 10 pesagens[^<]*<\/p>/;
  if(!re.test(h)) return h; setTimeout(iniciar,30); return h.replace(re,bloco(c)); };

// ---------- animação ----------
function contar(el,de,ate,dur,fmt,ease){ return new Promise(ok=>{ const t0=performance.now(); const f=t=>{ const k=Math.min(1,(t-t0)/dur); el.textContent=fmt(de+(ate-de)*(ease||eOut)(k)); if(k<1) el._raf=requestAnimationFrame(f); else ok(); }; el._raf=requestAnimationFrame(f); }); }
function fim(a){ if(a._fim) return; a._fim=true; (a._t||[]).forEach(clearTimeout); a.querySelectorAll('b').forEach(e=>e._raf&&cancelAnimationFrame(e._raf)); const mr=a.querySelector('.aj-mr'); mr&&mr._raf&&cancelAnimationFrame(mr._raf);
  a.classList.add('aj-sem','on1','on2','on3','on4','on5m','on5');
  a.querySelectorAll('.aj-m b').forEach(b=>b.textContent=f1(+b.dataset.v)); const rg=a.querySelector('.aj-regua'); if(rg) mr.style.left=rg.dataset.pos+'%';
  const v=a.querySelector('.aj-v'); if(v&&a.dataset.tipo==='muda'){ v.textContent=kTxt(+a.dataset.para); a.classList.add('aj-muda'); } }
function tocar(a){ if(a._ini) return; a._ini=true; a.addEventListener('click',()=>fim(a)); if(reduz()){ fim(a); return; }
  const T=(fn,ms)=>{ (a._t=a._t||[]).push(setTimeout(()=>{ if(!a._fim) fn(); },ms)); };
  T(()=>a.classList.add('on1'),0); T(()=>a.classList.add('on2'),120);
  if(a.dataset.tipo==='poucos'){ T(()=>a.classList.add('on5'),900); T(()=>{ a._fim=true; },1600); return; }
  T(()=>{ a.classList.add('on3'); a.querySelectorAll('.aj-m b').forEach(b=>contar(b,0,+b.dataset.v,900,f1)); },600);
  T(()=>{ a.classList.add('on4'); const rg=a.querySelector('.aj-regua'), mr=a.querySelector('.aj-mr'); const to=+rg.dataset.pos, t0=performance.now(); const f=t=>{ const k=Math.min(1,(t-t0)/1100); mr.style.left=(to*eIO(k))+'%'; if(k<1&&!a._fim) mr._raf=requestAnimationFrame(f); }; mr._raf=requestAnimationFrame(f); },1500);
  T(()=>{ a.classList.add('on5m'); if(a.dataset.tipo==='muda'){ a.classList.add('aj-muda','aj-mov'); contar(a.querySelector('.aj-v'),+a.dataset.de,+a.dataset.para,900,kTxt).then(()=>a.classList.remove('aj-mov')); } },2700);
  T(()=>a.classList.add('on5'),3600); T(()=>{ a._fim=true; },4300); }
function iniciar(){ const a=document.querySelector('#view .aj'); if(!a) return;
  if(!('IntersectionObserver' in window)){ tocar(a); return; } const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ tocar(a); io.disconnect(); } }),{threshold:.35}); io.observe(a); }
})();

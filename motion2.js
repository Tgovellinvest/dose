// ================= DOSE · v6.9 — Motion v2 (aprovado pelo Tiago em 08/11/2026) =================
// Oito movimentos, uma ideia: chegar no ponto e parar. Sem loop decorativo, ember uma vez por peça.
// Quem pede "reduzir movimento" no aparelho vê o estado final, sem animação (CSS em styles.css).
(function(){
const V=window.VIEWS, A=window.AFTER;
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const dig=n=>{ let s='<span class="m2-col">'; for(let d=0;d<10;d++) s+=`<i>${d}</i>`; return s+'</span>'; };

// 1 · Ponteiro na dose + odômetro (medidor da Hoje)
const odoHTML=v=>{ const t=String(Math.max(0,Math.min(100,Math.round(v)))); return `<span class="m2-odo" data-odo="${t}" aria-label="${t}">${t.split('').map(()=>dig()).join('')}</span>`; };
const _vh=V.hoje; V.hoje=(p)=>{ let h=_vh(p);
  h=h.replace(/<div class="big" data-count="(\d+)">\d+<\/div>/,(m,v)=>`<div class="big">${odoHTML(+v)}</div>`);
  return h; };
function ponteiro(){ const svg=document.querySelector('.nadose .arco'); if(!svg||svg.dataset.m2) return; svg.dataset.m2=1;
  const dot=svg.querySelector('.arco-dot'); const odo=document.querySelector('.nadose .m2-odo'); const v=odo?+odo.dataset.odo:0; const pct=Math.max(0,Math.min(100,v))/100;
  // marcas do arco: acendem até o valor
  let t=''; const n=21; for(let i=0;i<n;i++){ const a=Math.PI*(1-i/(n-1)), r1=82, r2=i%5===0?70:75; t+=`<line class="m2-tick${i===n-1?' fim':''}" x1="${(110+r1*Math.cos(a)).toFixed(1)}" y1="${(118-r1*Math.sin(a)).toFixed(1)}" x2="${(110+r2*Math.cos(a)).toFixed(1)}" y2="${(118-r2*Math.sin(a)).toFixed(1)}"/>`; }
  const g=document.createElementNS('http://www.w3.org/2000/svg','g'); g.setAttribute('class','m2-ticks'); g.innerHTML=t; svg.insertBefore(g,svg.firstChild);
  // ponteiro: o ponto ember vira a ponta de um ponteiro que gira até o valor e assenta
  if(dot){ dot.remove(); const p=document.createElementNS('http://www.w3.org/2000/svg','g'); p.setAttribute('class','m2-ptr'); p.style.setProperty('--a',(-90+180*pct)+'deg');
    p.innerHTML='<line x1="110" y1="36" x2="110" y2="14" stroke="var(--tx)" stroke-width="3" stroke-linecap="round"/><circle cx="110" cy="26" r="6" fill="var(--ember)"/>'; svg.appendChild(p); }
  const ticks=[...svg.querySelectorAll('.m2-tick')]; const ate=Math.round(pct*(n-1));
  if(reduz()){ ticks.forEach((x,i)=>x.classList.toggle('on',i<=ate)); if(odo) setOdo(odo); return; }
  requestAnimationFrame(()=>{ svg.classList.add('m2-run'); if(odo) setTimeout(()=>setOdo(odo),80); ticks.forEach((x,i)=>{ if(i<=ate) setTimeout(()=>x.classList.add('on'),120+i*55); }); }); }
function setOdo(o){ const ds=o.dataset.odo.split(''); [...o.children].forEach((c,k)=>{ c.style.transform=`translateY(-${+ds[k]}em)`; }); }

// 6 · Semana fechando: dias entram em cascata; semana cumprida ganha o selo
function semana(){ const s=document.querySelector('.semana4'); if(!s||s.dataset.m2) return; s.dataset.m2=1;
  const dias=[...s.querySelectorAll('.dia')]; dias.forEach((d,i)=>d.style.animationDelay=(i*50)+'ms');
  const plan=dias.filter(d=>d.classList.contains('feito')||d.querySelector('i.m,i.e')).length, feitos=dias.filter(d=>d.classList.contains('feito')).length;
  if(plan&&feitos>=plan){ const selo=document.createElement('div'); selo.className='m2-selo'; selo.innerHTML='Semana na dose<i>.</i>'; s.insertAdjacentElement('afterend',selo); } }

// 7 · Grão de filme nas capas (classe; textura em CSS, estática)
function grao(){ document.querySelectorAll('.view .hero4.nadose, .view .meuhero').forEach(e=>e.classList.add('m2-grao')); }

const _ah=A.hoje; A.hoje=(p)=>{ if(_ah) _ah(p); ponteiro(); semana(); grao(); };
const _ac=A.comunidade; A.comunidade=(p)=>{ const r=_ac?_ac(p):null; grao(); return r; };

// 2 · Tipografia cinética nas boas-vindas
const kin=txt=>`<h1 class="m2-kin" aria-label="${txt}">${txt.replace(/\.$/,'').split(' ').map((w,i,a)=>`<span class="w"><span style="animation-delay:${i*90}ms">${w}${i===a.length-1?'<b class="m2-dot">.</b>':''}</span></span>`).join('')}</h1>`;
const _ob=V.onboard; if(_ob) V.onboard=(p)=>{ const h=_ob(p); return h.replace('<h1 style="font-size:44px">A dose certa.</h1>',kin('Vida na dose.')+'<p class="tiny" style="margin-top:6px">A dose certa, para treino, comida, sono e gente.</p>'); };

// 3 · Curva da dose no topo da Ciência
const curva=`<div class="m2-curva" aria-hidden="true"><svg viewBox="0 0 560 220"><line class="ax" x1="20" y1="190" x2="540" y2="190"/><rect class="zona" x="250" y="34" width="120" height="156" rx="8"/><path class="c" d="M20 186 C120 182 170 108 230 72 S340 38 400 36 S500 34 540 34"/><circle class="pt" cx="310" cy="47" r="8"/><text x="22" y="212">Estímulo</text><text x="538" y="212" text-anchor="end">Excesso</text><text class="ok" x="310" y="24" text-anchor="middle">O ponto certo</text></svg></div>`;
const _ci=V._ciencia; if(_ci) V._ciencia=()=>curva+_ci();

// 4 · Fichas em leque: a pilha se abre (CSS) — 5 · toque com preenchimento (CSS em .ck) — 8 · revelar ao rolar (CSS)
})();

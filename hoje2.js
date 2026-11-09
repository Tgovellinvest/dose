// ================= DOSE · v7.2 — nova tela Hoje (rodada 2 do DOSE Studio, aprovada pelo Tiago em 08/11/2026) =================
// Ordem: medidor "Você está na dose?" com os pilares → ficha do treino de hoje em leque → semana em barras → mapa dos músculos → atalhos.
// Saem da Hoje: blocos de números (energia e peso), cartão da comunidade, caminho de 14 dias e volume da semana (continuam nas outras abas).
// Pilar Sono só aparece quando há check-in com sono. Dia sem treino: a ficha vira "Dia de descanso" com o próximo treino.
(function(){
const V=window.VIEWS;
const fmtN=v=>String(v).replace('.',',');

function ficha(hero){
  const eb=(hero.querySelector('.eyebrow')||{}).textContent||'Hoje';
  const nome=(hero.querySelector('b')||{}).textContent||'';
  const acoes=hero.querySelector('.grid2'); const nota=hero.querySelector('p.tiny');
  let lista='';
  try{ const p=programa(), ps=p.sessoes[proximaSessaoId()];
    if(ps&&ps.nome===nome){ const sl=ps.slots||[]; const series=sl.reduce((a,s)=>a+(s.sets||0),0);
      lista=sl.slice(0,3).map(s=>`<li><span>${esc((EX[s.ex]||{}).nome||s.ex)}</span><span class="num">${s.sets}×${esc(String(s.reps||'').replace('–','-'))}</span></li>`).join('')
        +`<li class="mais"><span>${sl.length>3?`+${sl.length-3} exercícios`:`${sl.length} exercícios`}</span><span class="num">${series} séries</span></li>`; } }catch(e){}
  const descanso=/Descanso/i.test(eb);
  const div=document.createElement('div'); div.className='ficha4';
  div.innerHTML=`<div class="f4 f4c" aria-hidden="true"></div><div class="f4 f4b" aria-hidden="true"></div>
    <div class="f4 f4a"><div class="eyebrow">${descanso?'Hoje':esc(eb)}</div>
      <h2>${descanso?'Dia de descanso<i>.</i>':esc(nome)+'<i>.</i>'}</h2>
      ${descanso&&nome?`<p class="f4-prox">Próximo treino, ${esc(nome)}</p>`:''}
      ${lista?`<ol>${lista}</ol>`:''}</div>`;
  const a=div.querySelector('.f4a'); if(acoes) a.appendChild(acoes); if(nota) a.appendChild(nota);
  return div;
}

function semana(s4){
  s4.classList.add('barras');
  const dias=[...s4.querySelectorAll('.dia')]; const feitos=dias.filter(d=>d.classList.contains('feito')).length;
  const plan=dias.filter(d=>d.classList.contains('feito')||d.querySelector('i.m,i.e')).length;
  dias.forEach(d=>{ if(!d.classList.contains('feito')&&!d.querySelector('i.m,i.e')) d.classList.add('desc'); });
  const r=document.createElement('div'); r.className='sem4-res';
  const falta=Math.max(0,plan-feitos);
  r.innerHTML=`<div><div class="eyebrow">Feitos na semana</div><div class="v num">${feitos}<small> de ${plan}</small></div></div>${plan&&falta?`<span class="sem4-falta">${falta===1?'Falta 1':'Faltam '+falta}</span>`:''}`;
  return r;
}

function sono(raiz){
  const ck=[...(S.checkins||[])].reverse().find(c=>c&&c.sono!=null); const pil=raiz.querySelector('.nadose .pilares'); if(!ck||!pil) return;
  const d=document.createElement('div'); d.className='pilar'; d.innerHTML=`<div class="pl-top pl-sono"><b>Sono</b><span class="tiny">check-in de ${esc(fmtD(ck.data))}</span><span class="pl-v">${fmtN(ck.sono)} h</span></div>`;
  pil.appendChild(d);
}

const _h=V.hoje; V.hoje=(p)=>{ const html=_h(p);
  try{
    const t=document.createElement('template'); t.innerHTML=html; const r=t.content;
    // sai da Hoje
    r.querySelectorAll('.tiles, #cardCom').forEach(x=>x.remove());
    const cam=r.querySelector('svg.caminho'); if(cam&&cam.closest('.card')) cam.closest('.card').remove();
    [...r.querySelectorAll('h3')].filter(h=>/Volume da semana/.test(h.textContent)).forEach(h=>{ const n=h.nextElementSibling; if(n&&n.classList.contains('card')) n.remove(); h.remove(); });
    // ficha
    const hero=[...r.querySelectorAll('.card.hero')].find(x=>x.querySelector('.grid2')); if(hero) hero.replaceWith(ficha(hero));
    // semana em barras + resumo, depois mapa e atalhos
    const s4=r.querySelector('.semana4'); const res=s4?semana(s4):null; if(s4&&res) s4.after(res);
    const corpo=[...r.querySelectorAll('.card')].find(c=>c.querySelector('.corpos')); const quick=r.querySelector('.quick');
    if(quick){ const ref=corpo||res||s4; if(ref) ref.after(quick); }
    sono(r);
    const out=document.createElement('div'); out.appendChild(r); return out.innerHTML;
  }catch(e){ return html; }
};
})();

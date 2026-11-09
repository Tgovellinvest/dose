// ================= DOSE · v7.0 — Motion por botão (aprovado pelo Tiago em 08/11/2026) =================
// Regras do Brand Book §7: toque 120 ms, ease (.2,.8,.2,1), confirmar = ember + escala 1,06 + vibração curta.
// Nada de bounce, rotação, loop ou glow. Nunca atrasa a navegação: a animação acompanha, não segura.
// Quem pede "reduzir movimento" no aparelho não vê nenhuma destas (CSS em styles.css).
(function(){
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const vib=ms=>{ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} }; // Android; o Safari do iPhone ignora
let alvo=null; // o que foi tocado, para reencontrar se a tela redesenhar

// Reencontra o elemento depois de um clique (a tela pode ter sido redesenhada pelo route()).
function depois(achar, fazer){ let n=0; const tenta=()=>{ const el=achar(); if(el){ fazer(el); return; } if(++n<20) requestAnimationFrame(tenta); }; requestAnimationFrame(()=>requestAnimationFrame(tenta)); }
const chave=el=>(el.textContent||'').trim().slice(0,40);

document.addEventListener('pointerdown',e=>{
  if(reduz()) return;
  const chip=e.target.closest('.chip'); const seg=e.target.closest('.seg button'); const btn=e.target.closest('.btn');
  if(chip){ const r=chip.getBoundingClientRect(); alvo={tipo:'chip',k:chave(chip),x:((e.clientX-r.left)/r.width*100).toFixed(0)+'%',y:((e.clientY-r.top)/r.height*100).toFixed(0)+'%',era:chip.classList.contains('on')}; return; }
  if(seg){ const s=seg.closest('.seg'); const on=s.querySelector('button.on'); const rs=s.getBoundingClientRect();
    alvo={tipo:'seg',k:[...s.querySelectorAll('button')].map(chave).join('|'),de:on?{l:on.getBoundingClientRect().left-rs.left,w:on.offsetWidth}:null}; return; }
  if(btn) alvo={tipo:'btn',el:btn};
},true);

document.addEventListener('click',e=>{
  if(reduz()||!alvo) return; const a=alvo; alvo=null;
  // 1 · Primário (ember): uma risca marfim corre embaixo do rótulo e para no fim. "Chegar no ponto e parar."
  if(a.tipo==='btn'&&a.el.classList.contains('em')&&a.el.isConnected){ const r=document.createElement('span'); r.className='m3-risca'; a.el.appendChild(r); setTimeout(()=>r.remove(),520); return; }
  // 2 · Chip: ao ligar, a cor preenche a partir do ponto do toque.
  if(a.tipo==='chip'&&!a.era){ depois(()=>[...document.querySelectorAll('.chip.on')].find(c=>chave(c)===a.k), c=>{
      c.style.setProperty('--m3x',a.x); c.style.setProperty('--m3y',a.y); c.style.setProperty('--m3c',getComputedStyle(c).backgroundColor);
      c.classList.remove('m3-fill'); void c.offsetWidth; c.classList.add('m3-fill'); setTimeout(()=>c.classList.remove('m3-fill'),320); }); return; }
  // 3 · Segmento: o trilho desliza da opção antiga para a nova.
  if(a.tipo==='seg'&&a.de){ depois(()=>[...document.querySelectorAll('.seg')].find(s=>[...s.querySelectorAll('button')].map(chave).join('|')===a.k), s=>{
      const on=s.querySelector('button.on'); if(!on) return; const rs=s.getBoundingClientRect(); const para={l:on.getBoundingClientRect().left-rs.left,w:on.offsetWidth};
      if(Math.abs(para.l-a.de.l)<2) return;
      const ind=document.createElement('span'); ind.className='m3-ind'; ind.style.cssText=`left:${a.de.l}px;width:${a.de.w}px`;
      s.classList.add('m3-mov'); s.appendChild(ind); requestAnimationFrame(()=>{ ind.style.left=para.l+'px'; ind.style.width=para.w+'px'; });
      setTimeout(()=>{ ind.remove(); s.classList.remove('m3-mov'); },300); }); }
});

// 4 · Série: confirmar = ember (já existe) + escala 1,06 + traço do check desenhando + vibração curta.
const _ts=window.toggleSet; if(_ts) window.toggleSet=(btn,rest)=>{ _ts(btn,rest); if(reduz()) return;
  if(btn.classList.contains('done')){ btn.classList.remove('m3-conf'); void btn.offsetWidth; btn.classList.add('m3-conf'); setTimeout(()=>btn.classList.remove('m3-conf'),420); vib(12); } };

// 5 · Barra de abas: ao trocar de aba, o ícone pousa no lugar (desenho da barra não muda, a pedido do parecer de arte).
const tb=document.getElementById('tabbar'); let ult=null;
if(tb) new MutationObserver(()=>{ const on=tb.querySelector('button.on'); if(!on||on===ult) return; const novo=ult!==null; ult=on;
  if(novo&&!reduz()){ on.classList.remove('m3-tab'); void on.offsetWidth; on.classList.add('m3-tab'); setTimeout(()=>on.classList.remove('m3-tab'),500); } })
  .observe(tb,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
})();

// ================= DOSE · v7.0 — mapa dos músculos e ícones em movimento (pedido do Tiago em 08/11/2026) =================
// Mesma ideia do Motion v2: chegar no ponto e parar. Uma vez por tela, sem loop, sem glow.
// 1 · Mapa dos músculos: a silhueta aparece e cada músculo acende de cima para baixo, como uma varredura do corpo.
//     Quem está em recuperação chega por último, com o "confirmar" da marca (escala 1,06 e assenta).
// 2 · Ícones: o traço se desenha (atalhos da Hoje, aba nova, ícones das listas ao abrir a tela).
// 3 · Medalhas conquistadas: o anel do nível se fecha em 600 ms (Brand Book §10).
// Reduzir movimento: nada anima, tudo aparece pronto (CSS).
(function(){
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const FORMAS='path,circle,rect,line,polyline,ellipse';

function musculos(raiz){
  raiz.querySelectorAll('svg.corpo:not([data-m3]), .mcorpo svg:not([data-m3])').forEach((svg,k)=>{ svg.dataset.m3=1;
    const kids=[...svg.children]; const base=kids.slice(0,2), mus=kids.slice(2);
    const atraso=k*90; // frente e depois costas
    base.forEach(el=>{ el.classList.add('m3-sil'); el.style.setProperty('--d',atraso+'ms'); });
    mus.forEach(el=>{ const cy=+(el.getAttribute('cy')||95); el.classList.add('m3-mu'); el.style.setProperty('--d',(atraso+220+cy/190*520).toFixed(0)+'ms');
      if(/warn/.test(el.getAttribute('fill')||'')) el.classList.add('m3-rec'); }); });
}
function desenha(svg,atraso){ if(!svg||svg.dataset.m3d) return; svg.dataset.m3d=1;
  svg.querySelectorAll(FORMAS).forEach(f=>{ if(f.getAttribute('fill')&&f.getAttribute('fill')!=='none') return; f.setAttribute('pathLength','1'); f.classList.add('m3-tr'); f.style.setProperty('--d',(atraso||0)+'ms'); }); }
function icones(raiz){
  raiz.querySelectorAll('.quick .ico').forEach((s,i)=>desenha(s,120+i*70));
  raiz.querySelectorAll('.list .item .n .ico, .item .n .ico').forEach((s,i)=>{ if(i<12) desenha(s,80+i*45); });
  raiz.querySelectorAll('.medal.won .medal-svg').forEach((m,i)=>{ if(m.dataset.m3) return; m.dataset.m3=1; const anel=m.querySelector('circle'); if(anel){ anel.setAttribute('pathLength','1'); anel.classList.add('m3-anel'); anel.style.setProperty('--d',(i*80)+'ms'); } });
}
function rodar(raiz){ if(reduz()) return; musculos(raiz); icones(raiz); }

const view=document.getElementById('view');
if(view){ let f=0; new MutationObserver(()=>{ cancelAnimationFrame(f); f=requestAnimationFrame(()=>rodar(view)); }).observe(view,{childList:true,subtree:true}); requestAnimationFrame(()=>rodar(view)); }

// Aba nova: o ícone pousa (botoes.js) e o traço se redesenha.
const tb=document.getElementById('tabbar');
if(tb) new MutationObserver(ms=>{ const b=ms.map(m=>m.target).find(t=>t.tagName==='BUTTON'&&t.classList.contains('m3-tab')); const on=b&&b.querySelector('.ico'); if(on&&!reduz()){ delete on.dataset.m3d; on.querySelectorAll('.m3-tr').forEach(x=>x.classList.remove('m3-tr')); void on.offsetWidth; desenha(on,40); } })
  .observe(tb,{subtree:true,attributes:true,attributeFilter:['class']});

window.m3Rodar=rodar; // usado pelo design system
})();

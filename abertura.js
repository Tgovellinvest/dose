// ================= DOSE · v7.3 — abertura "Do excesso à dose" para quem já é membro =================
// Primeira vez que o app abre no dia: a nuvem de grão vira a curva, o ponto assenta e entra "Vida na dose.".
// Dura uns 3,5 s; um toque em qualquer lugar pula. Não aparece no cadastro (lá já existe) nem com "reduzir movimento".
(function(){
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function hojeStr(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function abrir(){
  try{ if(typeof S==='undefined'||!S.onboarded||reduz()||!window.excessoDose) return; if(/^#onboard/.test(location.hash)) return;
    let ult=null; try{ ult=localStorage.getItem('dose-abertura'); }catch(e){}
    const dia=hojeStr(); if(ult===dia) return; try{ localStorage.setItem('dose-abertura',dia); }catch(e){}
    const ov=document.createElement('div'); ov.className='abertura'; ov.setAttribute('role','presentation');
    ov.innerHTML=`<div class="ab-in"><div class="m4-exc"><canvas></canvas></div>
      <h1 class="m2-kin m4-espera" aria-label="Vida na dose."><span class="w"><span style="animation-delay:2300ms">Vida</span></span><span class="w"><span style="animation-delay:2390ms">na</span></span><span class="w"><span style="animation-delay:2480ms">dose<b class="m2-dot">.</b></span></span></h1></div>`;
    document.body.appendChild(ov); requestAnimationFrame(()=>window.excessoDose(ov.querySelector('.m4-exc')));
    let fechou=false; const fecha=()=>{ if(fechou) return; fechou=true; ov.classList.add('sai'); setTimeout(()=>ov.remove(),420); };
    ov.addEventListener('pointerdown',fecha); setTimeout(fecha,3900);
  }catch(e){}
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(abrir,0)); else setTimeout(abrir,0);
})();

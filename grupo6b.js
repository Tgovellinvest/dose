// ================= DOSE · v8.6 — grupo de até 6 animado na tela do pedido (aprovado pelo Tiago em 09/11/2026) =================
// Torna visível a regra "fecha com 4, vai até 6, prazo de 24 h; se não fechar, não marca". Referência: protótipo "dose_grupo_fecha_com_4".
// Privacidade (decisão nova do Tiago): antes de fechar, cada lugar mostra só o nível; você aparece como "você". Nome só depois de fechar
// (o apelido do perfil público, como nos grupos). Dados reais de procura_lugares(); a animação nunca simula a chegada de alguém.
// Cada mudança importante toca uma vez: o que já foi visto fica em S.g6Vistos (no aparelho).
// Motion: cubic-bezier(.16,1,.3,1); contorno em easeInOutCubic 0,9 s; sem loop, bounce, brilho ou confete. Um toque pula para o fim.
(function(){
const U=()=>window.CLOUD&&CLOUD.user();
const rpc=(f,a)=>window.GRUPOS.rpc(f,a);
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const DS=["dom","seg","ter","qua","qui","sex","sáb"];
const quandoTxt=q=>{ const d=new Date(q); const dia=new Date(d.toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'})+'T12:00:00'); const [h,m]=d.toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hour12:false}).split(':').map(Number); return `${DS[dia.getDay()]} ${String(dia.getDate()).padStart(2,'0')}/${String(dia.getMonth()+1).padStart(2,'0')}, ${m?`${h}h${String(m).padStart(2,'0')}`:`${h}h`}`; };
const falta=ms=>{ if(ms<=0) return 'prazo encerrado'; const h=Math.floor(ms/36e5), d=Math.floor(h/24); return d?`faltam ${d} d ${h%24} h`:h?`faltam ${h} h`:`faltam ${Math.max(1,Math.round(ms/6e4))} min`; };
const ini=s=>String(s||'').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'·';

function tela(id,L){ const n=L.lugares.length, fech=L.estado==='fechado', nao=L.estado==='naofechou';
  const prazo=new Date(L.quando).getTime()-864e5, cri=new Date(L.criado).getTime(); const frac=nao?1:Math.max(0,Math.min(1,(Date.now()-cri)/Math.max(1,prazo-cri)));
  const lug=[...Array(6)].map((_,i)=>{ const x=L.lugares[i]; if(!x) return `<div class="g6s vazio"><span class="g6c"></span><small>&nbsp;</small></div>`;
    const rot=x.eu?'você':fech&&x.apelido?esc(String(x.apelido).split(' ')[0]):`nível ${x.nivel??'—'}`;
    return `<div class="g6s ${x.eu?'eu':''}" data-i="${i}"><span class="g6c">${fech&&!x.eu&&x.apelido?`<em>${esc(ini(x.apelido))}</em>`:''}</span><small>${rot}</small></div>`; }).join('');
  const k=fech?Math.max(4,n):4;
  const et=fech?'grupo fechado':nao?'não fechou':`${Math.min(n,4)} de 4 para fechar`;
  const fr=fech?`Quatro pessoas no mesmo ponto e horário: o grupo fechou e o treino está marcado.${n<6?` Ainda cabem mais ${6-n}.`:' O grupo está completo.'}`
    :nao?`O prazo acabou com ${n} ${n===1?'pessoa':'pessoas'}. Não fechou, então nada foi marcado. Dá pra pedir outro horário.`
    :`${4-Math.min(n,4)===1?"Falta":"Faltam"} ${4-Math.min(n,4)} para fechar. Se não fechar até ${quandoTxt(prazo)}, nada é marcado.`;
  return `<div class="eyebrow" style="text-align:left">Grupo de até 6 · corrida</div><b class="g6v-tt">${esc(L.ponto)}</b><p class="small" style="margin:2px 0 12px">${quandoTxt(L.quando)}</p>
   <div class="g6v" data-id="${id}" data-estado="${L.estado}" data-n="${n}" data-frac="${frac}">
    <div class="g6v-top"><span class="g6v-et">${et}</span><span class="g6v-rel" ${fech?'hidden':''}><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="t" cx="18" cy="18" r="15"/><circle class="p" cx="18" cy="18" r="15" pathLength="1"/></svg><small>${nao?'prazo encerrado':falta(prazo-Date.now())}</small></span></div>
    <div class="g6v-lug">${fech?`<svg class="g6v-ct" data-k="${k}" aria-hidden="true"><rect rx="16" ry="16" pathLength="1"/></svg>`:''}${lug}</div>
    <p class="g6v-fr">${fr}</p>
    ${nao?`<button class="btn sec" style="margin-top:10px" onclick="g6Outro('${esc(L.ponto).replace(/'/g,"\\'")}')">Pedir outro horário</button>`:''}
   </div>`; }

window.g6Outro=(ponto)=>{ closeSheet(); const P=window.DOSE_PONTOS||[]; const i=P.findIndex(p=>p.nome===ponto); setTimeout(()=>{ window.g6Novo(); if(i>=0&&window.g6Set) setTimeout(()=>g6Set('p',i),40); },250); };

window.g6Ver=async(id)=>{ if(!U()) return; let L=null; try{ L=await rpc('procura_lugares',{p_id:id}); }catch(e){ return toast(e.message||'Não consegui abrir agora'); } if(!L) return toast('Pedido não encontrado');
  sheet(tela(id,L)); const el=document.querySelector('#sheet .g6v'); if(el){ ajusta(el); setTimeout(()=>tocar(el,L),60); } };
// contorno: medido na tela (6 lugares de largura igual; contorna os ocupados, mínimo 4)
function ajusta(el){ const sv=el.querySelector('.g6v-ct'); if(!sv) return; const box=el.querySelector('.g6v-lug').getBoundingClientRect(); const W=box.width, H=box.height, k=+sv.dataset.k;
  const ss=[...el.querySelectorAll('.g6s .g6c, .g6s small')]; const top=Math.min(...ss.map(x=>x.getBoundingClientRect().top))-box.top-8, bot=Math.max(...ss.map(x=>x.getBoundingClientRect().bottom))-box.top+8;
  sv.setAttribute('viewBox',`0 0 ${W} ${H}`); const r=sv.querySelector('rect'); r.setAttribute('x',1); r.setAttribute('y',Math.max(1,top)); r.setAttribute('width',Math.max(0,W*k/6-2)); r.setAttribute('height',Math.max(0,Math.min(H-1,bot)-Math.max(1,top))); }

// ---------- animação ----------
const visto=id=>(S.g6Vistos||{})[id]||null;
const marcar=(id,e,n)=>{ S.g6Vistos=S.g6Vistos||{}; S.g6Vistos[id]={e,n}; save(); };
function fim(el){ if(el._fim) return; el._fim=true; (el._t||[]).forEach(clearTimeout); el.classList.add('g6-sem','on-lug','on-rel','on-ct','on-et','on-fr'); if(el.dataset.estado==='naofechou') el.classList.add('on-nao'); el.querySelectorAll('.g6s:not(.vazio)').forEach(s=>s.classList.add('on')); }
function tocar(el,L){ const id=el.dataset.id, est=el.dataset.estado, n=+el.dataset.n; const v=visto(id);
  el.style.setProperty('--frac',el.dataset.frac); el.addEventListener('click',()=>fim(el));
  const jaVisto=v&&v.e===est&&est!=='aberto'; const antes=jaVisto?Math.min(v.n,n):0;
  marcar(id,est,n);
  if(reduz()){ fim(el); return; }
  const T=(fn,ms)=>{ (el._t=el._t||[]).push(setTimeout(()=>{ if(!el._fim) fn(); },ms)); };
  const S6=[...el.querySelectorAll('.g6s:not(.vazio)')];
  if(jaVisto){ // estado final direto; só quem chegou depois enche (dentro do contorno já desenhado)
    el.classList.add('g6-sem','on-lug','on-rel','on-ct','on-et','on-fr'); if(est==='naofechou') el.classList.add('on-nao'); S6.slice(0,antes).forEach(s=>s.classList.add('on'));
    requestAnimationFrame(()=>{ el.classList.remove('g6-sem'); S6.slice(antes).forEach((s,i)=>T(()=>s.classList.add('on'),200+i*600)); T(()=>{ el._fim=true; },200+S6.length*600+600); }); return; }
  el.classList.add('on-lug'); T(()=>el.classList.add('on-rel'),100);
  const nEnche=est==='fechado'?Math.min(4,S6.length):S6.length; S6.slice(0,nEnche).forEach((s,i)=>T(()=>s.classList.add('on'),i*600));
  let t=(nEnche-1)*600+500;
  if(est==='fechado'){ T(()=>el.classList.add('on-ct'),t+150); t+=150+900; S6.slice(nEnche).forEach((s,i)=>T(()=>s.classList.add('on'),t+150+i*600)); t+=150+(S6.length-nEnche)*600; }
  if(est==='naofechou'){ T(()=>el.classList.add('on-nao'),t+200); t+=900; }
  T(()=>el.classList.add('on-et'),t+100); T(()=>el.classList.add('on-fr'),Math.max(t+300,3600)); T(()=>{ el._fim=true; },Math.max(t+300,3600)+600); }

// a lista de pedidos abre a tela; depois de pedir, abre o pedido novo
document.addEventListener('click',e=>{ const it=e.target.closest&&e.target.closest('.g6-i[data-id]'); if(it&&!e.target.closest('button')) window.g6Ver(it.dataset.id); });
const _pd=window.g6Pedir; if(_pd) window.g6Pedir=async(...a)=>{ await _pd(...a); try{ const L=await rpc('minhas_procuras',{})||[]; const x=L.slice().sort((p,q)=>String(q.id).localeCompare(String(p.id)))[0]; const novo=L.find(p=>!(S.g6Vistos||{})[p.id])||x; if(novo) window.g6Ver(novo.id); }catch(e){} };
})();

// ================= DOSE · v8.11 — editar grupo depois de criado + enquete no grupo (aprovado pelo Tiago em 14/11/2026) =================
// Editar (só o dono): nome, descrição e data de fim. Objetivo e meta não mudam depois de criado, para não mexer no placar de quem já treina.
// Enquete (qualquer membro): pergunta livre até 120 caracteres + 2 a 4 opções; dura 24 h ou 7 dias; voto único que dá para trocar;
// anônima por padrão (só o total), com a opção "mostrar quem votou"; quem criou ou o dono apaga. Dados em funções do banco (voto nunca exposto por tabela).
// Resultado só aparece depois de votar (ou para quem criou), para o voto não ser puxado pelo que já está na frente.
// Motion: cubic-bezier(.16,1,.3,1); barras chegam e param; sem loop, bounce, brilho ou confete. Reduzir movimento = estado final direto.
(function(){
const G=window.GRUPOS; if(!G) return;
// versão nova no ar: recarrega uma vez, se não houver tela aberta por cima (evita ficar preso na versão antiga em cache)
if('serviceWorker' in navigator&&navigator.serviceWorker.controller){ let rl=false; navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(rl) return; rl=true; setTimeout(()=>{ const sh=document.getElementById('sheet'); if(!sh||sh.classList.contains('hidden')) location.reload(); },400); }); }
const U=()=>window.CLOUD&&CLOUD.user();
const rpc=(f,a)=>G.rpc(f,a);
const $=id=>document.getElementById(id);
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const pri=s=>String(s||'').trim().split(/\s+/)[0]||'alguém';
const falta=iso=>{ const ms=new Date(iso).getTime()-Date.now(); if(ms<=0) return 'encerrada'; const h=Math.floor(ms/36e5), d=Math.floor(h/24); return d>=1?`faltam ${d} d${h%24?` ${h%24} h`:''}`:h>=1?`faltam ${h} h`:`faltam ${Math.max(1,Math.round(ms/6e4))} min`; };
let gid=null, enqs=[];

// ---------- enquetes no grupo ----------
window.gpPos=async(det)=>{ gid=det.g.id; window._gpDono=!!(U()&&det.g.dono===U().id); await carregar(); };
async function carregar(animar){ const el=$('gpEnq'); if(!el||!gid) return; try{ enqs=await rpc('enquetes_grupo',{p_grupo:gid})||[]; }catch(e){ enqs=[]; } el.innerHTML=enqs.map(cartao).join(''); toca(el); }
function cartao(e){ const u=U(); const eu=u&&u.id; const ver=e.meu!=null||e.criador===eu; const tot=Number(e.total)||0; const dono=e.criador===eu; const ops=e.opcoes||[];
  const lista=ops.map((t,i)=>{ const n=Number((e.contagem||[])[i])||0; const p=tot?Math.round(n/tot*100):0; const nomes=e.mostra_quem&&e.votantes?e.votantes.filter(v=>v.opcao===i).map(v=>pri(v.apelido)).join(', '):'';
    return `<button type="button" class="eq-o ${e.meu===i?'eu':''}" onclick="gpVotar('${e.id}',${i})" aria-pressed="${e.meu===i}"><i class="eq-b" style="--p:${ver?p:0}%"></i><span class="eq-t">${esc(t)}${ver&&nomes?`<small>${esc(nomes)}</small>`:''}</span>${ver?`<span class="eq-n num">${p}%</span>`:''}</button>`; }).join('');
  return `<div class="eq ${ver?'vis':''}" data-id="${e.id}"><div class="eq-top"><span>Enquete · ${esc(pri(e.criador_apelido))}</span><span>${falta(e.expira_em)}</span></div>
   <b class="eq-p">${esc(e.pergunta)}</b><div class="eq-l">${lista}</div>
   <div class="eq-rod"><span>${tot} ${tot===1?'voto':'votos'}${e.mostra_quem?'':' · anônima'}${!ver?' · vote para ver o resultado':''}</span>${(dono||(window._gpDono))?`<button class="lk" onclick="gpEnqApagar('${e.id}')">apagar</button>`:''}</div></div>`; }
function toca(el){ const cs=[...el.querySelectorAll('.eq')]; if(!cs.length) return; if(reduz()){ cs.forEach(c=>c.classList.add('on','sem')); return; } requestAnimationFrame(()=>requestAnimationFrame(()=>cs.forEach((c,i)=>setTimeout(()=>c.classList.add('on'),i*80)))); }
window.gpVotar=async(id,i)=>{ try{ await rpc('votar_enquete',{p_id:id,p_opcao:i}); await carregar(); }catch(e){ toast(e.message||'Não consegui votar agora'); } };
window.gpEnqApagar=async(id)=>{ if(!confirm('Apagar esta enquete para todo mundo?')) return; try{ await rpc('apagar_enquete',{p_id:id}); await carregar(); toast('Enquete apagada'); }catch(e){ toast(e.message); } };

// ---------- nova enquete ----------
let q={q:'',ops:['',''],quem:false,h:24};
const SUG=['Que horas treinamos sábado?','Qual percurso?','Qual treino de quinta?'];
function ler(){ const a=$('eqQ'); if(a) q.q=a.value; q.ops=q.ops.map((_,i)=>{ const x=$('eqO'+i); return x?x.value:q.ops[i]; }); }
function desenha(){ $('sheetBody').innerHTML=`<h3>Nova enquete</h3><label>Pergunta</label><input id="eqQ" maxlength="120" placeholder="Ex.: Que horas treinamos sábado?" value="${esc(q.q)}" autocomplete="off">
   <div class="chips" style="margin-top:6px">${SUG.map((s,i)=>`<button type="button" class="chip" onclick="eqSug(${i})">${esc(s)}</button>`).join('')}</div>
   <label>Opções</label>${q.ops.map((o,i)=>`<input id="eqO${i}" maxlength="40" placeholder="Opção ${i+1}" value="${esc(o)}" autocomplete="off" style="margin-bottom:8px">`).join('')}
   ${q.ops.length<4?`<button type="button" class="lk" onclick="eqMais()">+ Opção</button>`:''}
   <div class="gn-lin" style="margin-top:14px"><span>Duração</span></div><div class="chips"><button type="button" class="chip ${q.h===24?'on':''}" onclick="eqH(24)">24 horas</button><button type="button" class="chip ${q.h===168?'on':''}" onclick="eqH(168)">Fixada, 7 dias</button></div>
   <div class="chips" style="margin-top:6px"><button type="button" class="chip ${q.quem?'on':''}" onclick="eqQuem()">Mostrar quem votou</button></div>
   <p class="tiny" style="margin:6px 0 0">${q.quem?'Todo mundo do grupo vê o nome de quem votou em cada opção.':'Anônima: o grupo vê só o total de cada opção.'}</p>
   <button class="btn em" id="eqGo" style="margin-top:14px" onclick="eqPublicar()">Publicar</button><p class="tiny">Só o grupo vê. Quem criou ou o dono pode apagar.</p>`; }
window.gpEnqNova=(id)=>{ if(!U()) return; gid=id; q={q:'',ops:['',''],quem:false,h:24}; sheet(''); desenha(); };
window.eqSug=i=>{ ler(); q.q=SUG[i]; desenha(); };
window.eqMais=()=>{ ler(); if(q.ops.length<4) q.ops.push(''); desenha(); };
window.eqH=h=>{ ler(); q.h=h; desenha(); };
window.eqQuem=()=>{ ler(); q.quem=!q.quem; desenha(); };
window.eqPublicar=async()=>{ ler(); const ops=q.ops.map(x=>x.trim()).filter(Boolean); if(q.q.trim().length<2) return toast('Escreva a pergunta'); if(ops.length<2) return toast('Use pelo menos 2 opções'); const b=$('eqGo'); if(b){ b.disabled=true; b.textContent='Publicando…'; }
  try{ await rpc('criar_enquete',{p_grupo:gid,p_pergunta:q.q.trim(),p_opcoes:ops,p_mostra:q.quem,p_horas:q.h}); closeSheet(); toast('Enquete publicada'); await carregar(); const el=$('gpEnq'); el&&el.scrollIntoView&&el.scrollIntoView({behavior:reduz()?'auto':'smooth',block:'start'}); }
  catch(e){ toast(e.message||'Não consegui publicar agora'); const b2=$('eqGo'); if(b2){ b2.disabled=false; b2.textContent='Publicar'; } } };

// ---------- editar grupo (só o dono) ----------
window.gpEditar=(id)=>{ const det=G.cache.detalhe[id]; if(!det) return; const g=det.g, d=g.desafio||{}; const hoje=today(); const ini=d.ini||String(g.criado_em||hoje).slice(0,10); const max=G.shift(ini,365);
  sheet(`<h3>Editar grupo</h3><label>Nome</label><input id="geNome" maxlength="40" value="${esc(g.nome)}" autocomplete="off"><label>Descrição (opcional)</label><input id="geDesc" maxlength="200" value="${esc(g.descricao||'')}" autocomplete="off">
   ${d.fim?`<label>Termina em</label><input id="geFim" type="date" min="${hoje>ini?hoje:ini}" max="${max}" value="${d.fim}"><p class="tiny" style="margin:6px 0 0">Começou em ${fmtD(ini)}. Dá para estender ou encurtar.</p>`:''}
   <p class="tiny" style="margin:10px 0 0">O objetivo (${esc(G.descDesafio(Object.assign({},d,{fim:null})))}) não muda depois de criado, para não mexer no placar de quem já treina.</p>
   <button class="btn em" id="geGo" style="margin-top:14px" onclick="gpEditarOk('${id}')">Salvar</button>`); };
window.gpEditarOk=async(id)=>{ const det=G.cache.detalhe[id]; if(!det) return; const g=det.g, d=Object.assign({},g.desafio||{}); const nome=($('geNome').value||'').trim(); if(nome.length<2) return toast('Dê um nome ao grupo');
  const fimEl=$('geFim'); if(fimEl&&fimEl.value){ const ini=d.ini||String(g.criado_em||today()).slice(0,10); if(fimEl.value<ini) return toast('O fim tem que ser depois do começo'); if(fimEl.value<today()) return toast('O fim não pode ser uma data que já passou'); d.fim=fimEl.value; }
  const b=$('geGo'); if(b){ b.disabled=true; b.textContent='Salvando…'; }
  try{ const r=await G.api(`grupos?id=eq.${id}`,{method:'PATCH',headers:{'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify({nome,descricao:($('geDesc').value||'').trim(),desafio:d})});
    if(!r||!r.length) throw new Error('Só o dono do grupo edita');
    G.cache.grupos=null; try{ await G.sincronizar(id,d); }catch(e){} closeSheet(); toast('Grupo atualizado'); route(); }
  catch(e){ toast(e.message||'Não consegui salvar agora'); const b2=$('geGo'); if(b2){ b2.disabled=false; b2.textContent='Salvar'; } } };

// ---------- Criar grupo no começo da Comunidade ----------
const topo=()=>`<div class="grid2 cm-topo"><button class="btn em" onclick="gpNovo()">${I('plus')} Criar grupo</button><button class="btn sec" onclick="gpEntrar('')">${I('link')} Tenho código</button></div>`;
{ const V=window.VIEWS; const _c=V.comunidade; if(_c) V.comunidade=(p)=>{ const h=_c(p); const i=h.indexOf('</h1>'); return i>=0?h.slice(0,i+5)+topo()+h.slice(i+5):topo()+h; }; }

// ---------- o link do grupo basta: não perde o código em nenhum passo (15/11/2026, pedido do Tiago) ----------
// Quem abre o link sem ter feito a introdução ou sem conta vai para a introdução/login; o código fica guardado e o convite abre sozinho depois.
const PK='dose-gp-pend';
const pend=c=>{ try{ if(c===undefined) return localStorage.getItem(PK); if(c) localStorage.setItem(PK,c); else localStorage.removeItem(PK); }catch(e){ return null; } };
// retorna true se redirecionou para o convite guardado
function visa(h){ h=h||''; const m=/^#grupos\?(.*)$/.exec(h); const c=m?(new URLSearchParams(m[1]).get('c')||'').toUpperCase():''; const ok=/^[A-Z0-9]{5,10}$/.test(c);
  if(ok){ if(!S.onboarded||!U()) pend(c); return false; }
  if(S.onboarded&&U()&&!/^#onboard/.test(h)&&!/^#grupos\?g=/.test(h)){ const k=pend(); if(k){ pend(''); location.hash='grupos?c='+k; return true; } }
  return false; }
{ const _r=window.route; window.route=function(){ if(visa(location.hash)) return; return _r.apply(this,arguments); };
  window.addEventListener('hashchange',e=>{ try{ visa(new URL(e.newURL).hash); }catch(x){} },true); }
{ const A=window.AFTER; const _a=A&&A.grupos; if(_a) A.grupos=function(p){ if(p&&p.c&&!p.g&&!U()&&window.gpEntrar) setTimeout(()=>gpEntrar(p.c),250); return _a.apply(this,arguments); }; }
{ const _o=window.gpEntrarOk; if(_o) window.gpEntrarOk=async function(){ const r=await _o.apply(this,arguments); if(/g=/.test(location.hash||'')) pend(''); return r; }; }
})();

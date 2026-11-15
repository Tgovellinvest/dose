// ================= DOSE · v8.10 — criar grupo em 3 etapas + troféus dentro do grupo (aprovado pelo Tiago em 14/11/2026) =================
// Etapas: 1) nome e descrição, 2) o desafio (leque de cartões), 3) o convite (cartão do grupo carimbado).
// Motions aprovados: (1) cartão que se monta enquanto digita, (2) três traços de progresso, (3) desafios em leque, (5) carimbo do convite.
// Regras: cubic-bezier(.16,1,.3,1), chega e para, sem loop, bounce, brilho ou confete. Um toque pula para o fim. Reduzir movimento = estado final direto.
// Desafios só com dado que o app já registra (dias, treinos, km, minutos, sequência). Carga, peso e dieta nunca entram.
// Troféus: sempre derivados do placar do grupo (nada inventado); valem só dentro do grupo.
(function(){
const G=window.GRUPOS; if(!G) return;
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=id=>document.getElementById(id);
const eIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

const CAT=[
 {id:'c3',nome:'3 dias por semana',sub:'Constância leve',tipo:'dias',meta:3,per:'semana',sem:4,ic:'calendar'},
 {id:'c4',nome:'4 dias por semana',sub:'Constância firme',tipo:'dias',meta:4,per:'semana',sem:6,ic:'flag'},
 {id:'c5',nome:'5 dias por semana',sub:'Ritmo alto',tipo:'dias',meta:5,per:'semana',sem:4,ic:'flame'},
 {id:'t12',nome:'Treinos no período',sub:'Quem junta mais treinos',tipo:'treinos',meta:12,per:'total',sem:4,ic:'strength'},
 {id:'k30',nome:'30 km',sub:'Corrida, pedal ou caminhada',tipo:'km',meta:30,per:'total',sem:4,ic:'run'},
 {id:'k50',nome:'50 km',sub:'Corrida, pedal ou caminhada',tipo:'km',meta:50,per:'total',sem:4,ic:'run'},
 {id:'k100',nome:'100 km',sub:'Para quem já tem base',tipo:'km',meta:100,per:'total',sem:4,ic:'run'},
 {id:'m300',nome:'300 min por semana',sub:'Tempo em movimento',tipo:'min',meta:300,per:'semana',sem:4,ic:'heart'},
 {id:'seq',nome:'Maior sequência',sub:'Dias seguidos treinando',tipo:'seq',meta:null,per:'total',sem:4,ic:'flame'},
 {id:'todo',nome:'Todo dia',sub:'Um treino por dia',tipo:'dias',meta:null,per:'total',sem:2,ic:'target',todo:true},
 {id:'livre',nome:'Livre',sub:'Você define',tipo:'dias',meta:4,per:'semana',sem:4,ic:'plus',livre:true}];
const cat=id=>CAT.find(c=>c.id===id)||CAT[1];
const UNID={dias:'dias ativos',treinos:'treinos',km:'km',min:'minutos'};
const PASSO={dias:1,treinos:1,km:5,min:30};
const PADRAO={dias:{meta:4,per:'semana'},treinos:{meta:12,per:'total'},km:{meta:30,per:'total'},min:{meta:300,per:'semana'}};
const MAPA={'7dias':'c5','mes':'c4','100km':'k100'}; // modelos da aba Comunidade

let st={};
const novo=(pre)=>{ const c=cat(pre||'c4'); st={p:1,nome:'',desc:'',pre:c.id,tipo:c.tipo,meta:c.meta,per:c.per,sem:c.sem,ini:today(),criando:false,g:null,_t:[]}; };
const T=(fn,ms)=>{ st._t.push(setTimeout(fn,ms)); };
const limpaT=()=>{ (st._t||[]).forEach(clearTimeout); st._t=[]; };
const desafio=()=>{ const c=cat(st.pre); const seq=st.tipo==='seq'; return {tipo:st.tipo,meta:seq?null:c.todo?st.sem*7:st.meta,periodo:(c.todo||seq)?'total':st.per,ini:st.ini,fim:G.shift(st.ini,st.sem*7-1)}; };

// ---------- estrutura ----------
function casca(){ return `<div class="gn" role="group" aria-label="Criar grupo">
  <div class="gn-pr" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="gn-card" id="gnCard"><svg class="gn-ct" aria-hidden="true"><rect rx="18" ry="18" pathLength="1"/></svg>
   <div class="gn-top"><span>Grupo</span><span id="gnQ">Novo</span></div>
   <div class="gn-nome vazio" id="gnNome">Nome do grupo</div>
   <div class="gn-des" id="gnDes"></div>
   <div class="gn-cod" id="gnCod" aria-label="Código do convite">${[...Array(7)].map(()=>'<i>·</i>').join('')}</div>
   <div class="gn-rod" id="gnRod"></div></div>
  <div id="gnCorpo"></div></div>`; }

function card(){ const n=$('gnNome'); if(!n) return; const nome=(st.nome||'').trim(); n.textContent=nome||'Nome do grupo'; n.classList.toggle('vazio',!nome);
  const d=$('gnDes'), r=$('gnRod'); if(st.p>=2){ const ds=desafio(); d.textContent=G.descDesafio(ds).replace(/ · até \d+\/\d+$/,'').replace('no total','no período'); d.classList.add('on'); r.textContent=`Começa ${fmtD(ds.ini)} · termina ${fmtD(ds.fim)}`; r.classList.add('on'); } else { d.classList.remove('on'); r.classList.remove('on'); }
  const q=$('gnQ'); if(q) q.textContent=st.p===3?'Pronto':'Novo'; }

function progresso(){ document.querySelectorAll('.gn-pr i').forEach((i,k)=>i.classList.toggle('on',k<st.p)); }
function entra(){ const c=$('gnCorpo'); if(!c) return; c.classList.remove('gn-in'); void c.offsetWidth; c.classList.add('gn-in'); }

// ---------- etapa 1 ----------
function p1(){ $('gnCorpo').innerHTML=`<label>Nome</label><input id="gpNome" maxlength="40" placeholder="Ex.: Grupo das 6h" value="${esc(st.nome)}" autocomplete="off" oninput="gnNome(this.value)" onkeydown="if(event.key==='Enter')gnProx()">
   <label>Descrição (opcional)</label><input id="gpDesc" maxlength="200" placeholder="Quem é, combinado, regra da casa" value="${esc(st.desc)}" autocomplete="off" oninput="gnDesc(this.value)">
   <button class="btn em" style="margin-top:16px" onclick="gnProx()">Continuar</button>
   <p class="tiny">Grupo fechado: só entra quem tem o código. Até 50 pessoas.</p>`; entra(); setTimeout(()=>{ const i=$('gpNome'); if(i){ if(i.value&&i.value!==st.nome){ st.nome=i.value; card(); } } },160); }
window.gnNome=v=>{ st.nome=v; card(); }; window.gnDesc=v=>{ st.desc=v; };

// ---------- etapa 2 ----------
function p2(){ $('gnCorpo').innerHTML=`<div class="eyebrow" style="text-align:left;margin:4px 0 2px">Escolha o desafio</div>
   <div class="gn-leque" id="gnLeque">${CAT.map((c,i)=>`<button type="button" class="gn-c ${c.id===st.pre?'on':''}" data-id="${c.id}" style="--i:${i}" onclick="gnPre('${c.id}')"><span class="ic">${I(c.ic,22)}</span><b>${esc(c.nome)}</b><small>${esc(c.sub)}</small></button>`).join('')}</div>
   <div id="gnAj"></div>
   <p class="gn-err" id="gnErr" role="alert"></p>
   <div class="grid2" style="margin-top:12px"><button class="btn ghost" onclick="gnVoltar()">Voltar</button><button class="btn em" id="gnGo" onclick="gnCriar()">Criar grupo</button></div>
   <p class="tiny">O placar conta dias em que cada um registrou treino no DOSE. Sem carga, sem peso, sem dieta.</p>`; ajuste(); entra();
  const lq=$('gnLeque'); if(reduz()) lq.classList.add('abre','sem'); else requestAnimationFrame(()=>requestAnimationFrame(()=>lq.classList.add('abre'))); }
function ajuste(){ const c=cat(st.pre), seq=st.tipo==='seq', todo=!!c.todo; const el=$('gnAj'); if(!el) return; const ds=desafio();
  const meta=(!seq&&!todo)?`<div class="gn-lin"><span>Meta</span><div class="gn-step"><button type="button" aria-label="Menos" onclick="gnMeta(-1)">−</button><b class="num">${st.meta}</b><button type="button" aria-label="Mais" onclick="gnMeta(1)">+</button></div><small>${UNID[st.tipo]}</small></div>
    <div class="seg gn-seg"><button class="${st.per==='semana'?'on':''}" onclick="gnPer('semana')">por semana</button><button class="${st.per==='total'?'on':''}" onclick="gnPer('total')">no período</button></div>`:'';
  el.innerHTML=`${c.livre?`<div class="chips" style="margin-top:10px">${Object.keys(UNID).map(k=>`<button type="button" class="chip ${st.tipo===k?'on':''}" onclick="gnTipo('${k}')">${k==='dias'?'Dias ativos':k==='min'?'Minutos':UNID[k][0].toUpperCase()+UNID[k].slice(1)}</button>`).join('')}</div>`:''}${meta}
   <div class="gn-lin" style="margin-top:12px"><span>Duração</span></div><div class="chips">${[2,4,6,8].map(n=>`<button type="button" class="chip ${st.sem===n?'on':''}" onclick="gnSem(${n})">${n} sem</button>`).join('')}</div>
   <p class="tiny" style="margin:6px 0 0">Começa ${st.ini===today()?'hoje':fmtD(st.ini)} · termina ${fmtD(ds.fim)}. <button type="button" class="lk" onclick="gnData()">${st.ini===today()?'Outra data':'Começar hoje'}</button></p>
   <input id="gnIni" type="date" value="${st.ini}" hidden onchange="gnIni(this.value)">`; card(); }
window.gnPre=id=>{ const c=cat(id); st.pre=id; st.tipo=c.tipo; st.meta=c.meta; st.per=c.per; st.sem=c.sem; document.querySelectorAll('.gn-c').forEach(b=>b.classList.toggle('on',b.dataset.id===id)); ajuste(); };
window.gnTipo=k=>{ st.tipo=k; st.meta=PADRAO[k].meta; st.per=PADRAO[k].per; ajuste(); };
window.gnMeta=d=>{ const p=PASSO[st.tipo]||1; const max=st.per==='semana'&&st.tipo==='dias'?7:9999; st.meta=Math.max(p,Math.min(max,(st.meta||p)+d*p)); ajuste(); };
window.gnPer=v=>{ st.per=v; if(st.tipo==='dias'&&v==='semana') st.meta=Math.min(st.meta,7); ajuste(); };
window.gnSem=n=>{ st.sem=n; ajuste(); };
window.gnData=()=>{ if(st.ini!==today()){ st.ini=today(); ajuste(); return; } const i=$('gnIni'); if(!i) return; i.hidden=false; i.min=today(); try{ i.showPicker&&i.showPicker(); }catch(e){} i.focus(); };
window.gnIni=v=>{ if(v&&v>=today()){ st.ini=v; ajuste(); } };

// ---------- navegação ----------
function passo(n){ st.p=n; progresso(); card(); if(n===1) p1(); else if(n===2) p2(); else p3(); }
window.gnProx=()=>{ if(st.p===1){ st.nome=(($('gpNome')||{}).value||st.nome||'').trim(); st.desc=(($('gpDesc')||{}).value||st.desc||'').trim(); if(st.nome.length<2) return toast('Dê um nome ao grupo'); passo(2); } };
window.gnVoltar=()=>{ if(st.p===2) passo(1); };
window.gnCriar=async()=>{ if(st.criando) return; st.criando=true; const b=$('gnGo'), er=$('gnErr'); if(er) er.textContent=''; if(b){ b.disabled=true; b.textContent='Criando…'; }
  try{ const g=await G.criar(st.nome,st.desc,desafio()); st.g=g; if(!g.codigo){ try{ const r=await G.api(`grupos?id=eq.${g.id}&select=codigo`); g.codigo=r[0]&&r[0].codigo; }catch(e){} } G.cache.grupos=null; passo(3); }
  catch(e){ st.criando=false; const b2=$('gnGo'); if(b2){ b2.disabled=false; b2.textContent='Criar grupo'; } const er2=$('gnErr'); if(er2) er2.textContent=e.message||'Não consegui criar agora. Tente de novo.'; } };

// ---------- etapa 3: carimbo do convite ----------
function p3(){ const g=st.g||{}; const cod=String(g.codigo||'').toUpperCase(); const link=`${location.origin}${location.pathname}#grupos?c=${cod}`;
  $('gnCod').innerHTML=[...(cod||'·······')].map(()=>'<i>·</i>').join(''); $('gnCod').dataset.cod=cod;
  $('gnCorpo').innerHTML=`<div class="gn-fim" id="gnFim"><p class="gn-fr">Grupo criado. Quem tem o código entra. O placar conta dias com treino registrado, sem carga, sem peso, sem dieta.</p>
   <button class="btn em" onclick="gpConvidar('${esc(st.nome).replace(/'/g,"\\'")}','${esc(cod)}')">${I('share')} Convidar</button>
   <div class="grid2" style="margin-top:8px"><button class="btn sec" onclick="navigator.clipboard.writeText('${link}').then(()=>toast('Link copiado'))">Copiar link</button><button class="btn ghost" onclick="gnAbrir()">Abrir o grupo</button></div></div>`;
  const cd=$('gnCard'); cd.classList.add('p3'); medir(); cd.addEventListener('click',fimAnim); carimba(); }
window.gnAbrir=()=>{ const id=st.g&&st.g.id; closeSheet(); toast('Grupo criado'); if(id) go('grupos',{g:id}); };
function medir(){ const cd=$('gnCard'), sv=cd.querySelector('.gn-ct'), r=sv.querySelector('rect'); const W=cd.offsetWidth, H=cd.offsetHeight; sv.setAttribute('viewBox',`0 0 ${W} ${H}`); r.setAttribute('x',1); r.setAttribute('y',1); r.setAttribute('width',W-2); r.setAttribute('height',H-2); }
function letras(){ const el=$('gnCod'); const cod=el.dataset.cod||''; [...el.children].forEach((i,k)=>{ i.textContent=cod[k]||'·'; i.classList.add('on'); }); }
function fimAnim(){ if(st._fim) return; st._fim=true; limpaT(); const cd=$('gnCard'); if(!cd) return; cd.classList.add('feito'); letras(); const f=$('gnFim'); f&&f.classList.add('on'); }
function carimba(){ st._fim=false; const cd=$('gnCard'); if(reduz()){ fimAnim(); return; }
  requestAnimationFrame(()=>requestAnimationFrame(()=>cd.classList.add('desenha')));
  const cod=$('gnCod'); const cs=[...cod.children]; const t0=1050;
  cs.forEach((i,k)=>T(()=>{ i.textContent=(cod.dataset.cod||'')[k]||'·'; i.classList.add('on'); },t0+k*90));
  T(()=>{ cd.classList.add('feito'); },t0+cs.length*90+100); T(()=>{ const f=$('gnFim'); f&&f.classList.add('on'); },t0+cs.length*90+250); T(()=>{ st._fim=true; },t0+cs.length*90+900); }

// ---------- abrir ----------
function abre(pre){ novo(pre); sheet(casca()); progresso(); card(); p1(); }
window.gpNovo=()=>window.garantirConta?garantirConta(()=>abre(),'Para criar o grupo'):abre();
window.comModelo=k=>{ if(!(window.CLOUD&&CLOUD.user())) return garantirConta(()=>comModelo(k),'Para criar o desafio'); abre(MAPA[k]||'c4'); setTimeout(()=>{ const i=$('gpNome'); const nm={'7dias':'7 dias','mes':'Mês sem falhar','100km':'100 km'}[k]; if(i&&nm&&!i.value){ i.value=nm; gnNome(nm); } },60); };

// ---------- troféus (derivados do placar; só dentro do grupo) ----------
function longest(set,ini,fim){ const ds=[...set].filter(x=>x>=ini&&x<=fim).sort(); let best=0,cur=0,prev=null; ds.forEach(x=>{ cur=prev&&G.shift(prev,1)===x?cur+1:1; prev=x; if(cur>best) best=cur; }); return best; }
function trofeus(det){ const u=window.CLOUD&&CLOUD.user(); if(!u) return ''; const g=det.g, d=g.desafio||{}; const pl=G.placar(det); const out=[];
  const nm=o=>esc(o.m.apelido)+(o.m.user_id===u.id?' (você)':'');
  const add=(t,L,det_)=>{ if(L.length) out.push({t,q:L.slice(0,3).map(nm).join(', ')+(L.length>3?` e mais ${L.length-3}`:''),d:det_,eu:L.some(o=>o.m.user_id===u.id)}); };
  const rk=G.ranking(det,'desafio','dias'); const por={}; rk.L.forEach(o=>por[o.m.user_id]=o);
  if(d.meta&&d.periodo==='total') add('Fechou o desafio',pl.lista.filter(o=>o.pct!=null&&o.pct>=1),`${d.meta} ${UNID[d.tipo]||'dias ativos'}`);
  if(d.meta&&d.periodo==='semana'){ add('Bateu a meta da semana',pl.lista.filter(o=>o.pct!=null&&o.pct>=1),`${d.meta} ${UNID[d.tipo]||'dias ativos'} nesta semana`);
    // semanas seguidas na meta
    const val=(uid,w)=>{ const X=det.dias.filter(x=>x.user_id===uid&&x.treinos>0&&G.semanaDe(x.data)===w&&x.data>=pl.ini&&x.data<=pl.fim); return d.tipo==='km'?X.reduce((a,x)=>a+Number(x.km),0):d.tipo==='treinos'?X.reduce((a,x)=>a+x.treinos,0):d.tipo==='min'?X.reduce((a,x)=>a+x.min,0):new Set(X.map(x=>x.data)).size; };
    const w0=G.semanaDe(today()); const seqS=det.membros.map(m=>{ let w=w0, n=0; if(val(m.user_id,w)<d.meta) w=G.shift(w,-7); while(w>=G.semanaDe(pl.ini)&&val(m.user_id,w)>=d.meta){ n++; w=G.shift(w,-7); } return {m,n}; }).filter(o=>o.n>=2).sort((a,b)=>b.n-a.n);
    if(seqS.length){ const top=seqS.filter(o=>o.n===seqS[0].n); out.push({t:'Semanas seguidas na meta',q:top.slice(0,3).map(nm).join(', '),d:`${seqS[0].n} semanas seguidas`,eu:top.some(o=>o.m.user_id===u.id)}); } }
  // mais km da semana
  const rkm=G.ranking(det,'semana','km'); const topKm=rkm.L.filter(o=>o.pos===1&&o.km>0); if(topKm.length&&rkm.L.some(o=>o.km>0)&&det.membros.length>1) add('Mais km da semana',topKm,`${String(topKm[0].km).replace('.',',')} km`);
  // maior sequência do desafio
  const sq=det.membros.map(m=>({m,n:por[m.user_id]?longest(por[m.user_id].datas,rk.ini,rk.fim):0})).filter(o=>o.n>=3); if(sq.length){ const mx=Math.max(...sq.map(o=>o.n)); add('Maior sequência do desafio',sq.filter(o=>o.n===mx),`${mx} dias seguidos`); }
  // primeiro a chegar na meta (período total)
  if(d.meta&&d.periodo==='total'&&['dias','treinos','km','min'].includes(d.tipo)){ const quando=det.membros.map(m=>{ const X=det.dias.filter(x=>x.user_id===m.user_id&&x.treinos>0&&x.data>=pl.ini&&x.data<=pl.fim).sort((a,b)=>a.data<b.data?-1:1); let acc=0; for(const x of X){ acc+=d.tipo==='km'?Number(x.km):d.tipo==='treinos'?x.treinos:d.tipo==='min'?x.min:1; if(acc>=d.meta) return {m,data:x.data}; } return null; }).filter(Boolean).sort((a,b)=>a.data<b.data?-1:1);
    if(quando.length){ const q0=quando.filter(o=>o.data===quando[0].data); out.push({t:'Primeiro a chegar na meta',q:q0.slice(0,3).map(nm).join(', '),d:`em ${fmtD(quando[0].data)}`,eu:q0.some(o=>o.m.user_id===u.id)}); } }
  return `<h3>Troféus</h3>${out.length?`<div class="gn-tr">${out.map((o,i)=>`<div class="gn-t ${o.eu?'eu':''}" style="--i:${i}"><span class="ic">${I('trophy',22)}</span><div><b>${esc(o.t)}</b><div class="small">${o.q}</div><div class="tiny">${esc(o.d)}</div></div></div>`).join('')}</div>`:`<div class="card sub small">Os troféus aparecem quando o primeiro cumprir. Ficam só dentro do grupo.</div>`}<p class="tiny">Cada troféu sai do placar do grupo. Não vai para o perfil público nem para ranking da cidade.</p>`; }
window.gpTrofeus=trofeus;
})();

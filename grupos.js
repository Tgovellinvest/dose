// ================= DOSE · Grupos (Fase A) =================
// Grupo fechado por convite, desafio com prazo, placar por CONSISTÊNCIA (dias cumpridos), feed com os registros dos membros.
// Ranking só entre membros (semana/mês/desafio; pontos, dias, treinos, km, min, sequência). Sem feed aberto: só quem tem o código entra. Dados: Supabase (RLS por membro).
(function(){
const V=window.VIEWS, A=window.AFTER; const C=()=>window.CLOUD;
const URL_='https://typfaauucqkztdhmbhqb.supabase.co'; const KEY='sb_publishable_MwvaO9YLPu_PwR_MqVQm-Q_QCAEPJHI';
async function AH(){ const h=await C()._ah(); return h; }
const api=async(path,opt={})=>{ const r=await fetch(`${URL_}/rest/v1/${path}`,Object.assign({headers:await AH()},opt,{headers:Object.assign(await AH(),opt.headers||{})})); if(!r.ok){ let m=r.statusText; try{ const j=await r.json(); m=j.message||j.msg||j.hint||m; }catch(e){} throw new Error(trad(m)); } const t=await r.text(); return t?JSON.parse(t):null; };
const rpc=async(fn,args)=>{ const r=await fetch(`${URL_}/rest/v1/rpc/${fn}`,{method:'POST',headers:await AH(),body:JSON.stringify(args)}); if(!r.ok){ let m=r.statusText; try{ const j=await r.json(); m=j.message||m; }catch(e){} throw new Error(trad(m)); } return r.json(); };
const trad=m=>({sessao:"Entre na conta primeiro",codigo:"Código não encontrado",cheio:"Grupo cheio (50 pessoas)",limite:"Você já criou 5 grupos"})[String(m).trim()]||m;
const apelido=()=>{ const u=C().user(); return (S.perfil.nome||"").split(" ")[0]||(u?u.email.split("@")[0]:"alguém"); };
const G={cache:{grupos:null,detalhe:{}}};
G.listar=async()=>{ G.cache.grupos=await api(`grupos?select=id,codigo,nome,descricao,dono,desafio,criado_em&order=criado_em.desc`); return G.cache.grupos; };
G.criar=async(nome,descricao,desafio)=>{ const g=await rpc('criar_grupo',{p_nome:nome,p_descricao:descricao,p_desafio:desafio,p_apelido:apelido()}); await G.sincronizar(g.id,g.desafio); return g; };
G.entrar=async(codigo)=>{ const g=await rpc('entrar_grupo',{p_codigo:codigo,p_apelido:apelido()}); await G.sincronizar(g.id,g.desafio); return g; };
G.sair=async(gid)=>{ const u=C().user(); await api(`grupo_membros?grupo_id=eq.${gid}&user_id=eq.${u.id}`,{method:'DELETE'}); };
G.apagar=async(gid)=>{ await api(`grupos?id=eq.${gid}`,{method:'DELETE'}); };
G.detalhe=async(gid)=>{ const [g,m,d,p]=await Promise.all([api(`grupos?id=eq.${gid}&select=*`),api(`grupo_membros?grupo_id=eq.${gid}&select=user_id,apelido,entrou_em`),api(`grupo_dias?grupo_id=eq.${gid}&select=user_id,data,treinos,km,min&order=data.desc&limit=2000`),api(`grupo_posts?grupo_id=eq.${gid}&select=id,user_id,tipo,data,resumo,criado_em,grupo_reacoes(user_id)&order=criado_em.desc&limit=60`)]); const det={g:g[0],membros:m,dias:d,posts:p}; G.cache.detalhe[gid]=det; return det; };
// Dias ativos deste aparelho dentro do período do desafio → grupo_dias (só o próprio)
G.sincronizar=async(gid,desafio)=>{ const u=C().user(); if(!u) return; const ini=(desafio&&desafio.ini)||"2000-01-01", fim=(desafio&&desafio.fim)||"2999-12-31"; const por={};
  S.logs.forEach(l=>{ if(l.data>=ini&&l.data<=fim){ const o=por[l.data]||(por[l.data]={treinos:0,km:0,min:0}); o.treinos++; o.min+=l.dur||0; } });
  S.bjj.forEach(l=>{ if(l.data>=ini&&l.data<=fim){ const o=por[l.data]||(por[l.data]={treinos:0,km:0,min:0}); o.treinos++; o.min+=l.min||0; } });
  S.cardio.forEach(l=>{ if(l.data>=ini&&l.data<=fim){ const o=por[l.data]||(por[l.data]={treinos:0,km:0,min:0}); o.treinos++; o.km+=l.dist||0; o.min+=l.min||0; } });
  const rows=Object.entries(por).map(([data,o])=>({grupo_id:gid,user_id:u.id,data,treinos:o.treinos,km:Math.round(o.km*100)/100,min:o.min})); if(!rows.length) return;
  await api(`grupo_dias?on_conflict=grupo_id,user_id,data`,{method:'POST',headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)}); };
G.sincronizarTodos=async()=>{ if(!C().user()) return; const gs=G.cache.grupos||await G.listar(); for(const g of gs){ try{ await G.sincronizar(g.id,g.desafio); }catch(e){} } };
G.postar=async(gid,tipo,resumo)=>{ const u=C().user(); await api(`grupo_posts`,{method:'POST',headers:{'Prefer':'return=minimal'},body:JSON.stringify({grupo_id:gid,user_id:u.id,tipo,data:today(),resumo})}); };
G.reagir=async(pid,on)=>{ const u=C().user(); if(on) await api(`grupo_reacoes`,{method:'POST',headers:{'Prefer':'return=minimal,resolution=ignore-duplicates'},body:JSON.stringify({post_id:pid,user_id:u.id})}); else await api(`grupo_reacoes?post_id=eq.${pid}&user_id=eq.${u.id}`,{method:'DELETE'}); };
G.apagarPost=async(pid)=>{ await api(`grupo_posts?id=eq.${pid}`,{method:'DELETE'}); };

// ---------- Placar por consistência ----------
// desafio: {tipo:'dias'|'km'|'treinos', meta, periodo:'semana'|'total', ini, fim}
function placar(det){ const d=det.g.desafio||{}; const t=today(); const ini=d.ini||det.g.criado_em.slice(0,10), fim=d.fim||"2999-12-31"; const ativo=t>=ini&&t<=fim; const semIni=semanaIni();
  const por={}; det.membros.forEach(m=>por[m.user_id]={m,dias:0,treinos:0,km:0,min:0,semana:0,seq:0});
  det.dias.forEach(x=>{ const o=por[x.user_id]; if(!o||x.data<ini||x.data>fim) return; o.dias++; o.treinos+=x.treinos; o.km+=Number(x.km)||0; o.min+=x.min||0; if(x.data>=semIni) o.semana++; });
  // sequência de dias/semanas cumpridos
  const metaSem=d.periodo==='semana'?(d.meta||3):null;
  Object.values(por).forEach(o=>{ const v=d.tipo==='km'?o.km:d.tipo==='treinos'?o.treinos:o.dias; o.valor=Math.round(v*10)/10; o.meta=d.meta||null;
    o.pct=d.meta?Math.min(1,(d.periodo==='semana'?(d.tipo==='km'?det.dias.filter(x=>x.user_id===o.m.user_id&&x.data>=semIni).reduce((a,x)=>a+Number(x.km),0):o.semana):v)/d.meta):null; });
  const lista=Object.values(por).sort((a,b)=>(b.pct??b.valor)-(a.pct??a.valor)||b.dias-a.dias);
  return {lista,ini,fim,ativo,metaSem,d}; }
// ---------- Ranking (só entre membros do grupo) ----------
// Pontos DOSE: 10 por dia ativo + 2 se treinou 2x no dia + 5 por semana em que bateu a meta de dias do desafio.
const METRICAS=[["pontos","Pontos"],["dias","Dias"],["treinos","Treinos"],["km","Km"],["min","Minutos"],["seq","Sequência"]];
const UN={pontos:"pts",dias:"dias",treinos:"treinos",km:"km",min:"min",seq:"dias seguidos"};
function janela(det,per,ate){ const d=det.g.desafio||{}; const t=ate||today();
  if(per==='semana'){ const si=semanaDe(t); return [si,t]; }
  if(per==='mes'){ return [t.slice(0,8)+'01',t]; }
  const ini=d.ini||det.g.criado_em.slice(0,10); const fim=d.fim&&d.fim<t?d.fim:t; return [ini,fim]; }
const shift=(d,n)=>{ const x=new Date(d+"T12:00:00"); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); };
function semanaDe(t){ const x=new Date(t+"T12:00:00"); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x.toISOString().slice(0,10); }
function ranking(det,per,met,ate){ const [ini,fim]=janela(det,per,ate); const d=det.g.desafio||{}; const metaSem=(d.tipo==='dias'&&d.periodo==='semana'&&d.meta)?d.meta:null;
  const por={}; det.membros.forEach(m=>por[m.user_id]={m,dias:0,treinos:0,km:0,min:0,seq:0,pontos:0,datas:new Set(),sem:{}});
  det.dias.forEach(x=>{ const o=por[x.user_id]; if(!o||x.data<ini||x.data>fim||!(x.treinos>0)) return; o.datas.add(x.data); o.treinos+=x.treinos; o.km+=Number(x.km)||0; o.min+=x.min||0; if(x.treinos>=2) o.pontos+=2; const w=semanaDe(x.data); o.sem[w]=(o.sem[w]||0)+1; });
  Object.values(por).forEach(o=>{ o.dias=o.datas.size; o.pontos+=10*o.dias; if(metaSem) o.pontos+=5*Object.values(o.sem).filter(n=>n>=metaSem).length; o.km=Math.round(o.km*10)/10;
    let c=fim; if(!o.datas.has(c)) c=shift(c,-1); let n=0; while(o.datas.has(c)&&c>=ini){ n++; c=shift(c,-1); } o.seq=n; });
  const L=Object.values(por).sort((a,b)=>b[met]-a[met]||b.dias-a.dias||a.m.apelido.localeCompare(b.m.apelido));
  let pos=0,prev=null; L.forEach((o,i)=>{ if(o[met]!==prev){ pos=i+1; prev=o[met]; } o.pos=pos; });
  return {L,ini,fim}; }
function rankAnterior(det,per,met){ const t=today(); const ate=per==='semana'?shift(semanaDe(t),-1):shift(t,-7); const r=ranking(det,per,met,ate); if(!r.L.some(o=>o[met]>0)) return null; const m={}; r.L.forEach(o=>m[o.m.user_id]=o.pos); return m; }
window._gpRk=window._gpRk||{per:'semana',met:'pontos'};
function rankingHTML(det){ const u=C().user(); const {per,met}=window._gpRk; const r=ranking(det,per,met); const ant=rankAnterior(det,per,met); const L=r.L; const fmt=v=>met==='km'?String(v).replace('.',','):v;
  const eu=L.find(o=>o.m.user_id===u.id); let frase="";
  if(eu){ const acima=L.filter(o=>o.pos<eu.pos).pop(); const emp=L.filter(o=>o.pos===eu.pos&&o!==eu); if(eu[met]>0&&emp.length){ const nomes=emp.slice(0,2).map(o=>o.m.apelido).join(' e ')+(emp.length>2?` e mais ${emp.length-2}`:''); frase=eu.pos===1?`Empate na liderança com ${nomes}. Um dia ativo a mais desempata.`:`Você está em ${eu.pos}º, empatado com ${nomes}.`; } else if(eu.pos===1&&L.length>1){ const seg=L.find(o=>o.pos>1); frase=seg?`Você lidera. ${seg.m.apelido} está a ${fmt(Math.round((eu[met]-seg[met])*10)/10)} ${UN[met]}.`:"Você lidera."; } else if(acima){ const gap=Math.round((acima[met]-eu[met])*10)/10; const dica=met==='pontos'?` (≈ ${Math.max(1,Math.ceil((gap+0.1)/10))} dia${Math.ceil((gap+0.1)/10)>1?'s':''} ativo${Math.ceil((gap+0.1)/10)>1?'s':''})`:""; frase=`Você está em ${eu.pos}º. Faltam ${fmt(gap||1)} ${UN[met]}${dica} para passar ${acima.m.apelido}.`; } }
  const top=L.slice(0,3); const cor=i=>['var(--gold)','var(--silver)','var(--bronze)'][i];
  const podio=L.length>=2&&top[0][met]>0?`<div class="podio">${[1,0,2].filter(i=>top[i]).map(i=>{ const o=top[i]; return `<div class="pd p${Math.min(3,o.pos)}"><div class="av" style="border-color:${cor(o.pos-1)}">${esc((o.m.apelido||"?").slice(0,1).toUpperCase())}</div><b>${esc(o.m.apelido)}</b><span class="num">${fmt(o[met])}</span><div class="degrau" style="background:${cor(o.pos-1)}">${o.pos}º</div></div>`; }).join("")}</div>`:"";
  const seta=o=>{ if(!ant||ant[o.m.user_id]==null) return ""; const dlt=ant[o.m.user_id]-o.pos; return dlt>0?`<span class="rk up">▲${dlt}</span>`:dlt<0?`<span class="rk dn">▼${-dlt}</span>`:`<span class="rk eq">=</span>`; };
  return `<div class="row" style="justify-content:space-between;align-items:baseline"><h3 style="margin:0">Ranking</h3><button class="btn sm ghost" style="width:auto;padding:4px 10px" onclick="gpComoPontua()">Como pontua</button></div>
   <div class="seg" id="gpPer">${[["semana","Semana"],["mes","Mês"],["desafio","Desafio"]].map(([k,n])=>`<button class="${per===k?'on':''}" onclick="gpRk('per','${k}','${det.g.id}')">${n}</button>`).join("")}</div>
   <div class="chips" style="margin-top:8px;flex-wrap:nowrap;overflow-x:auto">${METRICAS.map(([k,n])=>`<button class="chip ${met===k?'on':''}" style="white-space:nowrap;flex:0 0 auto" onclick="gpRk('met','${k}','${det.g.id}')">${n}</button>`).join("")}</div>
   ${podio}
   ${frase?`<div class="card sub small" style="margin-top:10px">${esc(frase)}</div>`:""}
   <div class="card" style="padding:4px 14px;margin-top:10px">${L.map(o=>`<div class="row rkrow ${o.m.user_id===u.id?'eu':''}"><div class="row" style="gap:12px;align-items:center"><span class="num pos">${o.pos}º</span><div><b>${esc(o.m.apelido)}${o.m.user_id===u.id?' <span class="tiny">(você)</span>':''}</b> ${seta(o)}<div class="tiny">${o.dias} dia${o.dias===1?"":"s"} · ${o.treinos} treino${o.treinos===1?"":"s"}${o.km?` · ${fmt(o.km)} km`:""}${o.seq>1?` · ${o.seq} seguidos`:""}</div></div></div><b class="num">${fmt(o[met])}<span class="tiny"> ${met==='pontos'?'pts':''}</span></b></div>`).join("")}</div>
   <p class="tiny">${per==='semana'?'Semana de segunda a hoje':per==='mes'?'Mês corrente':'Período do desafio'} · ${fmtD(r.ini)} a ${fmtD(r.fim)}. Setas comparam com ${per==='semana'?'a semana passada':'7 dias atrás'}. Ranking só entre membros: ninguém de fora vê.</p>`; }
window.gpRk=(k,v,gid)=>{ window._gpRk[k]=v; const det=G.cache.detalhe[gid]; const el=document.getElementById('gpRank'); if(det&&el) el.innerHTML=rankingHTML(det); };
window.gpComoPontua=()=>sheet(`<h3>Como pontua</h3><ul class="small"><li><b>10 pontos</b> por dia com treino, esporte ou cardio registrado no DOSE.</li><li><b>+2</b> no dia em que registrar 2 atividades (máximo 1 bônus por dia).</li><li><b>+5</b> por semana em que bater a meta de dias do desafio.</li><li>Empate: ganha quem tem mais dias ativos.</li></ul><p class="small">A pontuação premia aparecer com constância, não volume. Treinar 3 vezes no mesmo dia não vale mais que voltar amanhã.</p><p class="tiny">Km, minutos e sequência têm ranking próprio. Carga, peso e dieta nunca entram.</p>`);
const descDesafio=d=>{ if(!d||!d.tipo) return "Sem desafio: só o placar de dias ativos."; const un={dias:"dias ativos",km:"km",treinos:"treinos"}[d.tipo]; return `${d.meta} ${un} ${d.periodo==='semana'?"por semana":"no total"}${d.fim?` · até ${fmtD(d.fim)}`:""}`; };
const TIPOPOST={sessao:"strength",cardio:"run",semana:"calendar",mes:"calendar",medalha:"trophy",objetivo:"target"};

// ---------- Views ----------
V.grupos=(p)=>{ if(window.setTitle) setTitle("Grupos"); if(!C().user()) return `<h1 class="sec">Grupos</h1><div class="vazio"><div class="eyebrow">Fase A</div><p class="serif">Grupo fechado, por convite. <i>Ranking só entre quem está dentro.</i></p><p class="small">Um desafio com prazo, ranking da semana, do mês e do desafio, e os registros de cada um. Para usar, entre na sua conta.</p><button class="btn ghost" style="margin-top:12px" onclick="go('mais',{t:'conta'})">Entrar na conta</button></div>`;
  if(p.g) return `<button class="btn sm ghost" onclick="go('grupos')">‹ Grupos</button><div id="gpDet"><div class="card sub small">carregando…</div></div>`;
  return `<h1 class="sec">Grupos</h1>
   <div class="grid2"><button class="btn em" onclick="gpNovo()">${I("plus")} Criar</button><button class="btn sec" onclick="gpEntrar('${esc(p.c||"")}')">${I("link")} Tenho código</button></div>
   <div id="gpLista" style="margin-top:12px"><div class="card sub small">carregando…</div></div>
   <p class="tiny">Grupos são fechados: só entra quem tem o código. O ranking premia constância (dias em que você treinou), não carga. Até 50 pessoas por grupo.</p>`; };
A.grupos=async(p)=>{ if(!C().user()) return; if(p.c&&!p.g){ setTimeout(()=>gpEntrar(p.c),200); }
  try{ if(p.g){ const det=await G.detalhe(p.g); const el=document.getElementById('gpDet'); if(el) el.innerHTML=gpDetalheHTML(det); } else { const gs=await G.listar(); const el=document.getElementById('gpLista'); if(!el) return; const pos=await G.posicoes(gs).catch(()=>({})); el.innerHTML=gs.length?`<div class="list">${gs.map(g=>`<div class="item" onclick="go('grupos',{g:'${g.id}'})"><div class="n">${I("users")}</div><div class="t"><b>${esc(g.nome)}</b><span>${pos[g.id]?`${pos[g.id].pos}º de ${pos[g.id].n} na semana · `:''}${esc(descDesafio(g.desafio))}</span></div><span class="arrow">›</span></div>`).join("")}</div>`:`<div class="vazio"><p class="serif">Quem aparece, conta. <i>Chame quem treina com você.</i></p><p class="small">Crie um grupo e mande o código, ou peça o código de um que já existe.</p></div>`; } }
  catch(e){ const el=document.getElementById('gpLista')||document.getElementById('gpDet'); if(el) el.innerHTML=`<div class="card"><b>Não carregou</b><p class="small">${esc(e.message)}</p></div>`; } };
function gpDetalheHTML(det){ const u=C().user(); const g=det.g; const pl=placar(det); const dono=g.dono===u.id; const link=`${location.origin}${location.pathname}#grupos?c=${g.codigo}`;
  const nomeDe=id=>{ const m=det.membros.find(x=>x.user_id===id); return m?m.apelido:"alguém"; };
  return `<h1>${esc(g.nome)}</h1>${g.descricao?`<p class="small">${esc(g.descricao)}</p>`:""}
   <div class="card hero"><div class="row" style="justify-content:space-between;align-items:center"><div><div class="eyebrow">Desafio</div><b>${esc(descDesafio(g.desafio))}</b><div class="tiny">${pl.ativo?"em andamento":"encerrado"}${(()=>{const me=pl.lista.find(o=>o.m.user_id===u.id);return me&&me.pct!=null?` · você: ${Math.round(me.pct*100)}%`:''})()} · ${det.membros.length} ${det.membros.length===1?"pessoa":"pessoas"}</div></div>${I("flag",28)}</div></div>
   <div id="gpRank">${rankingHTML(det)}</div>
   <p class="tiny">Conta dias em que a pessoa registrou treino, esporte ou cardio no DOSE. Ninguém vê sua carga, seu peso ou sua dieta.</p>
   <div class="card"><b>Convidar</b><p class="small">Código <span class="mono" style="font-size:18px;letter-spacing:.12em">${esc(g.codigo)}</span></p><div class="grid2"><button class="btn sm sec" onclick="gpConvidar('${esc(g.nome)}','${esc(g.codigo)}')">${I("share")} Enviar convite</button><button class="btn sm ghost" onclick="navigator.clipboard.writeText('${link}').then(()=>toast('Link copiado'))">Copiar link</button></div></div>
   <h3>Registros</h3>${det.posts.length?det.posts.map(p=>{ const reag=(p.grupo_reacoes||[]).length; const eu=(p.grupo_reacoes||[]).some(r=>r.user_id===u.id); return `<div class="card" style="padding:12px 14px"><div class="row" style="justify-content:space-between;align-items:flex-start"><div class="row" style="gap:10px;align-items:flex-start"><div class="n">${I(TIPOPOST[p.tipo]||"card")}</div><div><b>${esc(nomeDe(p.user_id))}</b> <span class="tiny">· ${fmtD(p.data)}</span><div class="small">${esc(p.resumo.titulo||"")}</div><div class="tiny">${(p.resumo.linhas||[]).map(esc).join(" · ")}</div></div></div><button class="btn sm ${eu?'em':'ghost'}" style="width:auto;padding:6px 10px" onclick="gpReagir('${p.id}',${eu?0:1},'${g.id}')">${I("flame",16)} ${reag||""}</button></div>${p.user_id===u.id?`<button class="btn sm ghost" style="width:auto;margin-top:6px;padding:4px 8px" onclick="gpApagarPost('${p.id}','${g.id}')">apagar</button>`:""}</div>`; }).join(""):`<div class="card sub small">Ainda sem registros. Ao finalizar um treino ou corrida, toque em "Postar no grupo" na tela de compartilhar.</div>`}
   <div class="card" style="margin-top:16px"><button class="btn sm ghost" onclick="gpSair('${g.id}',${dono})">${dono?"Apagar grupo (sou o dono)":"Sair do grupo"}</button></div>`; }

// ---------- Ações ----------
window.gpNovo=()=>{ const t=today(); const fim=new Date(); fim.setDate(fim.getDate()+42); sheet(`<h3>Criar grupo</h3><label>Nome</label><input id="gpNome" maxlength="40" placeholder="Ex.: Turma das 6h"><label>Descrição (opcional)</label><input id="gpDesc" maxlength="200" placeholder="Quem é, combinado, regra da casa">
   <label>Desafio</label><div class="chips" id="gpTipo">${[["dias","Dias ativos"],["treinos","Treinos"],["km","Km"]].map(([k,n],i)=>`<button class="chip ${i===0?'on':''}" data-k="${k}" onclick="[...gpTipo.children].forEach(c=>c.classList.remove('on'));this.classList.add('on')">${n}</button>`).join("")}</div>
   <div class="grid2"><div><label>Meta</label><input id="gpMeta" type="number" min="1" value="4"></div><div><label>Por</label><select id="gpPer"><option value="semana">semana</option><option value="total">total do período</option></select></div></div>
   <div class="grid2"><div><label>Começa</label><input id="gpIni" type="date" value="${t}"></div><div><label>Termina</label><input id="gpFim" type="date" value="${fim.ymd()}"></div></div>
   <button class="btn em" style="margin-top:12px" onclick="gpCriar()">Criar e gerar código</button><p class="tiny">O placar conta dias em que cada um registrou treino no DOSE. Sem carga, sem peso, sem dieta.</p>`); };
window.gpCriar=async()=>{ const nome=(document.getElementById('gpNome').value||"").trim(); if(nome.length<2) return toast("Dê um nome ao grupo"); const tipo=(document.querySelector('#gpTipo .on')||{}).dataset?.k||"dias"; const des={tipo,meta:num(gpMeta.value)||3,periodo:gpPer.value,ini:gpIni.value,fim:gpFim.value};
  try{ const g=await G.criar(nome,gpDesc.value.trim(),des); closeSheet(); toast("Grupo criado"); go('grupos',{g:g.id}); }catch(e){ toast(e.message); } };
window.gpEntrar=(cod)=>{ sheet(`<h3>Entrar em um grupo</h3><label>Código do convite</label><input id="gpCod" value="${esc(cod||"")}" placeholder="7 letras" style="text-transform:uppercase;letter-spacing:.12em" autocapitalize="characters"><label>Como você quer aparecer</label><input id="gpApel" maxlength="30" value="${esc(apelido())}"><button class="btn em" style="margin-top:12px" onclick="gpEntrarOk()">Entrar</button>`); };
window.gpEntrarOk=async()=>{ const cod=(gpCod.value||"").trim().toUpperCase(); if(cod.length<5) return toast("Código inválido"); try{ const g=await rpc('entrar_grupo',{p_codigo:cod,p_apelido:gpApel.value.trim()||apelido()}); await G.sincronizar(g.id,g.desafio); closeSheet(); toast(`Você entrou em ${g.nome}`); go('grupos',{g:g.id}); }catch(e){ toast(e.message); } };
window.gpConvidar=async(nome,cod)=>{ const link=`${location.origin}${location.pathname}#grupos?c=${cod}`; const text=`Bora treinar junto no DOSE? Grupo "${nome}". Código ${cod} — ou abre o link: ${link}`; try{ if(navigator.share) await navigator.share({title:"DOSE · "+nome,text}); else { await navigator.clipboard.writeText(text); toast("Convite copiado"); } }catch(e){} };
window.gpReagir=async(pid,on,gid)=>{ try{ await G.reagir(pid,!!on); go('grupos',{g:gid}); route(); }catch(e){ toast(e.message); } };
window.gpApagarPost=async(pid,gid)=>{ if(!confirm("Apagar este registro do grupo?")) return; try{ await G.apagarPost(pid); route(); }catch(e){ toast(e.message); } };
window.gpSair=async(gid,dono)=>{ if(!confirm(dono?"Apagar o grupo para todo mundo? Não dá para desfazer.":"Sair do grupo? Seus dias saem do placar.")) return; try{ if(dono) await G.apagar(gid); else await G.sair(gid); toast(dono?"Grupo apagado":"Você saiu"); go('grupos'); }catch(e){ toast(e.message); } };
// Postar um card no grupo (chamado pela tela de compartilhar)
window.gpPostarSheet=async(tipo,resumo)=>{ try{ const gs=G.cache.grupos||await G.listar(); if(!gs.length) return toast("Você ainda não está em nenhum grupo"); if(gs.length===1){ await G.postar(gs[0].id,tipo,resumo); await G.sincronizar(gs[0].id,gs[0].desafio); return toast(`Postado em ${gs[0].nome}`); }
  sheet(`<h3>Postar em qual grupo?</h3><div class="col">${gs.map(g=>`<button class="btn sec" onclick="gpPostarEm('${g.id}')">${esc(g.nome)}</button>`).join("")}</div>`); window._gpPost={tipo,resumo}; }catch(e){ toast(e.message); } };
window.gpPostarEm=async(gid)=>{ const p=window._gpPost; if(!p) return; try{ await G.postar(gid,p.tipo,p.resumo); const g=(G.cache.grupos||[]).find(x=>x.id===gid); if(g) await G.sincronizar(gid,g.desafio); closeSheet(); toast("Postado"); }catch(e){ toast(e.message); } };
G.posicoes=async(gs)=>{ if(!gs.length) return {}; const u=C().user(); const ids=gs.map(g=>g.id).join(','); const si=semanaDe(today());
  const [m,d]=await Promise.all([api(`grupo_membros?grupo_id=in.(${ids})&select=grupo_id,user_id,apelido`),api(`grupo_dias?grupo_id=in.(${ids})&data=gte.${si}&select=grupo_id,user_id,data,treinos,km,min&limit=5000`)]);
  const out={}; gs.forEach(g=>{ const det={g:Object.assign({criado_em:g.criado_em||today()},g),membros:m.filter(x=>x.grupo_id===g.id),dias:d.filter(x=>x.grupo_id===g.id)}; const r=ranking(det,'semana','pontos'); const eu=r.L.find(o=>o.m.user_id===u.id); if(eu) out[g.id]={pos:eu.pos,n:r.L.length}; }); return out; };
G.temGrupos=()=>!!(G.cache.grupos&&G.cache.grupos.length);
window.GRUPOS=G;
// Ao abrir com conta: sincroniza dias dos grupos (silencioso, 1x por abertura)
window.addEventListener('load',()=>{ setTimeout(()=>{ if(C().user()&&navigator.onLine) G.listar().then(()=>G.sincronizarTodos()).catch(()=>{}); },6000); });
})();

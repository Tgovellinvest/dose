// ================= DOSE · Grupos (Fase A) =================
// Grupo fechado por convite, desafio com prazo, placar por CONSISTÊNCIA (dias cumpridos), feed com os registros dos membros.
// Sem ranking público, sem feed aberto: só quem tem o código entra. Dados: Supabase (RLS por membro).
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
const descDesafio=d=>{ if(!d||!d.tipo) return "Sem desafio: só o placar de dias ativos."; const un={dias:"dias ativos",km:"km",treinos:"treinos"}[d.tipo]; return `${d.meta} ${un} ${d.periodo==='semana'?"por semana":"no total"}${d.fim?` · até ${fmtD(d.fim)}`:""}`; };
const TIPOPOST={sessao:"strength",cardio:"run",semana:"calendar",mes:"calendar",medalha:"trophy",objetivo:"target"};

// ---------- Views ----------
V.grupos=(p)=>{ if(!C().user()) return `<h1>Grupos</h1><div class="card"><b>Treine com quem você conhece</b><p class="small">Grupo fechado, por convite. Um desafio com prazo, um placar de constância e os registros de cada um. Sem ranking público.</p><p class="small">Para usar, entre na sua conta.</p><button class="btn em" onclick="go('mais',{t:'conta'})">Entrar na conta</button></div>`;
  if(p.g) return `<button class="btn sm ghost" onclick="go('grupos')">‹ Grupos</button><div id="gpDet"><div class="card sub small">carregando…</div></div>`;
  return `<h1>Grupos</h1>
   <div class="grid2"><button class="btn em" onclick="gpNovo()">${I("plus")} Criar grupo</button><button class="btn sec" onclick="gpEntrar('${esc(p.c||"")}')">${I("link")} Entrar com código</button></div>
   <div id="gpLista" style="margin-top:12px"><div class="card sub small">carregando…</div></div>
   <p class="tiny">Grupos são fechados: só entra quem tem o código. O placar conta dias em que você treinou, não carga. Até 50 pessoas por grupo.</p>`; };
A.grupos=async(p)=>{ if(!C().user()) return; if(p.c&&!p.g){ setTimeout(()=>gpEntrar(p.c),200); }
  try{ if(p.g){ const det=await G.detalhe(p.g); const el=document.getElementById('gpDet'); if(el) el.innerHTML=gpDetalheHTML(det); } else { const gs=await G.listar(); const el=document.getElementById('gpLista'); if(!el) return; el.innerHTML=gs.length?`<div class="list">${gs.map(g=>`<div class="item" onclick="go('grupos',{g:'${g.id}'})"><div class="n">${I("users")}</div><div class="t"><b>${esc(g.nome)}</b><span>${esc(descDesafio(g.desafio))}</span></div><span class="arrow">›</span></div>`).join("")}</div>`:`<div class="card"><b>Nenhum grupo ainda</b><p class="small">Crie um e mande o código para quem treina com você. Ou peça o código de um grupo que já existe.</p></div>`; } }
  catch(e){ const el=document.getElementById('gpLista')||document.getElementById('gpDet'); if(el) el.innerHTML=`<div class="card"><b>Não carregou</b><p class="small">${esc(e.message)}</p></div>`; } };
function gpDetalheHTML(det){ const u=C().user(); const g=det.g; const pl=placar(det); const dono=g.dono===u.id; const link=`${location.origin}${location.pathname}#grupos?c=${g.codigo}`;
  const nomeDe=id=>{ const m=det.membros.find(x=>x.user_id===id); return m?m.apelido:"alguém"; };
  return `<h1>${esc(g.nome)}</h1>${g.descricao?`<p class="small">${esc(g.descricao)}</p>`:""}
   <div class="card hero"><div class="row" style="justify-content:space-between;align-items:center"><div><div class="eyebrow">Desafio</div><b>${esc(descDesafio(g.desafio))}</b><div class="tiny">${pl.ativo?"em andamento":"encerrado"} · ${det.membros.length} ${det.membros.length===1?"pessoa":"pessoas"}</div></div>${I("flag",28)}</div></div>
   <div class="card"><b>Convidar</b><p class="small">Código <span class="mono" style="font-size:18px;letter-spacing:.12em">${esc(g.codigo)}</span></p><div class="grid2"><button class="btn sm sec" onclick="gpConvidar('${esc(g.nome)}','${esc(g.codigo)}')">${I("share")} Enviar convite</button><button class="btn sm ghost" onclick="navigator.clipboard.writeText('${link}').then(()=>toast('Link copiado'))">Copiar link</button></div></div>
   <h3>Placar de constância</h3><div class="card" style="padding:6px 14px">${pl.lista.map((o,i)=>`<div class="row" style="justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)"><div class="row" style="gap:12px;align-items:center"><span class="num" style="width:26px;color:var(--tx3)">${i+1}</span><div><b>${esc(o.m.apelido)}${o.m.user_id===u.id?' <span class="tiny">(você)</span>':''}</b><div class="tiny">${o.dias} dia${o.dias===1?"":"s"} ativo${o.dias===1?"":"s"}${o.km?` · ${Math.round(o.km*10)/10} km`:""}${o.treinos!==o.dias?` · ${o.treinos} treinos`:""}</div></div></div><div style="text-align:right;min-width:90px">${o.pct!=null?`<b class="num">${Math.round(o.pct*100)}%</b><div class="tiny">${pl.d.periodo==='semana'?'esta semana':'do total'}</div><div class="bar" style="width:80px"><i style="width:${Math.round(o.pct*100)}%;background:${o.pct>=1?'var(--ok)':'var(--ember)'}"></i></div>`:`<b class="num">${o.valor}</b>`}</div></div>`).join("")}</div>
   <p class="tiny">Conta dias em que a pessoa registrou treino, esporte ou cardio no DOSE. Ninguém vê sua carga, seu peso ou sua dieta.</p>
   <h3>Registros</h3>${det.posts.length?det.posts.map(p=>{ const reag=(p.grupo_reacoes||[]).length; const eu=(p.grupo_reacoes||[]).some(r=>r.user_id===u.id); return `<div class="card" style="padding:12px 14px"><div class="row" style="justify-content:space-between;align-items:flex-start"><div class="row" style="gap:10px;align-items:flex-start"><div class="n">${I(TIPOPOST[p.tipo]||"card")}</div><div><b>${esc(nomeDe(p.user_id))}</b> <span class="tiny">· ${fmtD(p.data)}</span><div class="small">${esc(p.resumo.titulo||"")}</div><div class="tiny">${(p.resumo.linhas||[]).map(esc).join(" · ")}</div></div></div><button class="btn sm ${eu?'em':'ghost'}" style="width:auto;padding:6px 10px" onclick="gpReagir('${p.id}',${eu?0:1},'${g.id}')">${I("flame",16)} ${reag||""}</button></div>${p.user_id===u.id?`<button class="btn sm ghost" style="width:auto;margin-top:6px;padding:4px 8px" onclick="gpApagarPost('${p.id}','${g.id}')">apagar</button>`:""}</div>`; }).join(""):`<div class="card sub small">Ainda sem registros. Ao finalizar um treino ou corrida, toque em "Postar no grupo" na tela de compartilhar.</div>`}
   <div class="card" style="margin-top:16px"><button class="btn sm ghost" onclick="gpSair('${g.id}',${dono})">${dono?"Apagar grupo (sou o dono)":"Sair do grupo"}</button></div>`; }

// ---------- Ações ----------
window.gpNovo=()=>{ const t=today(); const fim=new Date(); fim.setDate(fim.getDate()+42); sheet(`<h3>Criar grupo</h3><label>Nome</label><input id="gpNome" maxlength="40" placeholder="Ex.: Turma das 6h"><label>Descrição (opcional)</label><input id="gpDesc" maxlength="200" placeholder="Quem é, combinado, regra da casa">
   <label>Desafio</label><div class="chips" id="gpTipo">${[["dias","Dias ativos"],["treinos","Treinos"],["km","Km"]].map(([k,n],i)=>`<button class="chip ${i===0?'on':''}" data-k="${k}" onclick="[...gpTipo.children].forEach(c=>c.classList.remove('on'));this.classList.add('on')">${n}</button>`).join("")}</div>
   <div class="grid2"><div><label>Meta</label><input id="gpMeta" type="number" min="1" value="4"></div><div><label>Por</label><select id="gpPer"><option value="semana">semana</option><option value="total">total do período</option></select></div></div>
   <div class="grid2"><div><label>Começa</label><input id="gpIni" type="date" value="${t}"></div><div><label>Termina</label><input id="gpFim" type="date" value="${fim.toISOString().slice(0,10)}"></div></div>
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
G.temGrupos=()=>!!(G.cache.grupos&&G.cache.grupos.length);
window.GRUPOS=G;
// Ao abrir com conta: sincroniza dias dos grupos (silencioso, 1x por abertura)
window.addEventListener('load',()=>{ setTimeout(()=>{ if(C().user()&&navigator.onLine) G.listar().then(()=>G.sincronizarTodos()).catch(()=>{}); },6000); });
})();

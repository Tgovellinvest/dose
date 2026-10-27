// ================= DOSE · v6.0 — "Você está na dose?" + Comunidade =================
// Posicionamento: DOSE é lifestyle + comunidade. A Hoje abre com uma pergunta da semana
// (treino, nutrição, metas), a energia do dia vira um tile, e a aba Comunidade substitui o "Mais".
// Referências (pesquisa 2026-10-27): WHOOP (um número + toque abre o porquê), Strava Local Legend
// (constância > velocidade), Apple (desafio de 7 dias por convite), GymRats (modelos de pontuação),
// Gentler Streak (módulos conforme a hora). Sem vermelho, sem culpa.
(function(){
const V=window.VIEWS, A=window.AFTER;
const DIASEM=["seg","ter","qua","qui","sex","sab","dom"], DN={seg:"S",ter:"T",qua:"Q",qui:"Q",sex:"S",sab:"S",dom:"D"};
const corDose=s=>s>=85?"var(--ok)":s>=65?"var(--tx)":s>=45?"var(--warn)":"var(--stop)";
const pctTxt=x=>Math.round(x*100)+"%";
const diasDaSemana=()=>{ const si=semanaIni(); return DIASEM.map((dd,ix)=>{ const x=new Date(si+'T12:00:00'); x.setDate(x.getDate()+ix); return {dd,data:x.ymd()}; }); };
const metaKcal=()=>(S.perfil.protocoloCoach&&S.perfil.protocoloCoach.kcal)||(calcNutri(S.perfil)||{}).alvo||null;
const kcalDia=d=>S.diario.filter(z=>z.data===d).reduce((a,z)=>a+(z.k||0),0);
const corPct=x=>x==null?'var(--s3)':x>=0.8?'var(--bone)':x>=0.55?'var(--warn)':'var(--tx3)';

// ---------- Pilares ----------
function pilarTreino(){ const hoje=today(), semU=semanaUsuario(), ds=diasDaSemana();
  const plan=ds.filter(o=>{ const u=semU[o.dd]; return u&&(u.musc||(u.esportes||[]).length); });
  const feitos=ds.filter(o=>o.data<=hoje&&atividadesDe(o.data).length);
  const planAte=plan.filter(o=>o.data<hoje||(o.data===hoje&&atividadesDe(o.data).length)).length; // hoje só conta depois de feito
  let pct=null; if(plan.length) pct=planAte?Math.min(1,feitos.length/planAte):(feitos.length?1:null); else if(feitos.length) pct=1;
  const falta=Math.max(0,plan.length-feitos.length);
  const leitura=!plan.length?(feitos.length?`${feitos.length} ${feitos.length===1?'dia ativo':'dias ativos'} na semana. Defina seus dias no perfil para medir contra o plano.`:"Nada planejado. Defina seus dias de treino e esporte no perfil.")
    :falta===0?"Semana de treino fechada. Agora é recuperar.":`${feitos.length} de ${plan.length} dias feitos${pct>=1?', em dia com o plano':''}. ${falta===1?'Falta 1 dia':`Faltam ${falta} dias`} até domingo.`;
  const dias=ds.map(o=>{ const fez=o.data<=hoje&&atividadesDe(o.data).length; const pl=plan.some(x=>x.data===o.data); return {l:DN[o.dd],h:fez?1:pl?0.18:0.06,c:fez?'var(--bone)':pl?'transparent':'var(--s3)',borda:pl&&!fez,hoje:o.data===hoje}; });
  return {k:'treino',nome:'Treino',pct,barra:plan.length?feitos.length/plan.length:pct,valor:plan.length?`${feitos.length} de ${plan.length}`:`${feitos.length} dias`,leitura,dias,ir:"go('progresso',{g:'treino'})",irTxt:'Ver evolução do treino'}; }

function pilarNutri(){ const hoje=today(), meta=metaKcal(), ds=diasDaSemana();
  let ok=0, reg=0; const dias=ds.map(o=>{ const kc=o.data<=hoje?kcalDia(o.data):0; const dentro=kc>0&&meta&&Math.abs(kc-meta)/meta<=0.1; if(kc>0&&(o.data<hoje||dentro)){ reg++; if(dentro) ok++; } const r=meta&&kc?Math.min(1.3,kc/meta):0; return {l:DN[o.dd],h:kc?Math.max(0.1,r/1.3):0.06,c:kc?(dentro?'var(--bone)':'var(--tx3)'):'var(--s3)',hoje:o.data===hoje}; });
  const pct=reg?ok/reg:null;
  const leitura=!meta?"Complete peso, altura e objetivo no perfil para ter uma meta de calorias.":!reg?"Registre o que comeu para medir. Um dia já conta.":`${ok} de ${reg} ${reg===1?'dia':'dias'} dentro da meta de ${meta} kcal (±10%).${ok<reg?' A barra apagada é o dia que escapou.':''}`;
  return {k:'nutri',nome:'Nutrição',pct,valor:reg?`${ok} de ${reg}`:'—',leitura,dias,ir:"go('nutricao')",irTxt:'Abrir o diário'}; }

function pilarMetas(){ const itens=[];
  const antes=Math.max(0,DIASEM.indexOf(['dom','seg','ter','qua','qui','sex','sab'][new Date().getDay()]));
  (window.planosAtivos?planosAtivos():[]).forEach(esp=>{ const pp=planoProgresso(esp); if(!pp) return; const esperado=Math.floor(pp.sessSem*antes/7); const pct=esperado?Math.min(1,pp.feitasSem/esperado):(pp.feitasSem?1:null);
    if(pct!=null) itens.push({pct,t:`${pp.nome}: semana ${pp.semana} de ${pp.total}, ${pp.feitasSem} de ${pp.sessSem} sessões feitas`}); else itens.push({pct:null,t:`${pp.nome}: semana ${pp.semana} de ${pp.total}, ${pp.sessSem} sessões nesta semana`}); });
  const ob=S.perfil.objetivo||''; const dir=/^cut|recomp/.test(ob)?-1:/^bulk/.test(ob)?1:0; const pes=(S.pesagens||[]).slice().sort((a,b)=>a.data.localeCompare(b.data));
  if(dir&&pes.length>=4){ const lim=shiftData(today(),-7); const rec=pes.filter(x=>x.data>lim), ant=pes.filter(x=>x.data<=lim&&x.data>shiftData(today(),-14)); if(rec.length&&ant.length){ const m=a=>a.reduce((s,x)=>s+x.peso,0)/a.length; const dl=Math.round((m(rec)-m(ant))*10)/10; const certo=dir<0?dl<-0.1:dl>0.1; const parado=Math.abs(dl)<=0.1; itens.push({pct:certo?1:parado?0.6:0.3,t:`Peso: ${dl>0?'+':dl<0?'−':''}${String(Math.abs(dl)).replace('.',',')} kg na média de 7 dias${certo?', na direção certa':parado?', estável':', no sentido contrário ao objetivo'}`}); } }
  const comPct=itens.filter(x=>x.pct!=null); const pct=comPct.length?comPct.reduce((a,x)=>a+x.pct,0)/comPct.length:null;
  const leitura=itens.length?itens.map(x=>x.t).join(". ")+".":"Escolha um plano de esporte ou um objetivo de peso: é isso que aparece aqui.";
  const dias=comPct.map(x=>({l:'',h:Math.max(0.08,x.pct),c:corPct(x.pct)}));
  return {k:'metas',nome:'Metas',pct,valor:pct!=null?pctTxt(pct):itens.length?'em dia':'—',leitura,dias:dias.length?dias:null,ir:itens.length?"go('esportes')":"go('mais',{t:'perfil'})",irTxt:itens.length?'Ver planos':'Definir objetivo'}; }
const shiftData=(d,n)=>{ const x=new Date(d+'T12:00:00'); x.setDate(x.getDate()+n); return x.ymd(); };

window.naDose=()=>{ const pilares=[pilarTreino(),pilarNutri(),pilarMetas()]; const av=pilares.filter(p=>p.pct!=null);
  const score=av.length?Math.round(av.reduce((a,p)=>a+p.pct,0)/av.length*100):null;
  const estado=score==null?'A semana começa agora':score>=80?'Na dose':score>=55?'Quase na dose':'Abaixo da dose';
  const cor=score==null?'var(--tx2)':score>=80?'var(--ok)':score>=55?'var(--warn)':'var(--tx2)';
  const bons=av.filter(p=>p.pct>=0.8).map(p=>p.nome), pior=av.filter(p=>p.pct<0.8).sort((a,b)=>a.pct-b.pct)[0];
  let t,i; if(score==null){ t="Registre um treino ou uma refeição"; i="e o medidor começa a andar."; }
  else if(!pior){ t="Treino, comida e metas em dia."; i="Semana na dose."; }
  else { const dica={treino:"falta treino",nutri:"falta a comida",metas:"falta a meta andar"}[pior.k]; t=bons.length?`${bons.join(" e ")} em dia.`:"Semana em andamento."; i=`Agora ${dica}.`; }
  const h=new Date().getHours(); const sub=h>=18&&!kcalDia(today())?"Antes de dormir: registre o que comeu hoje.":h<11?"Bom dia. O treino de hoje está logo abaixo.":"";
  return {score,estado,cor,pilares,frase:{t,i,sub}}; };

window.V_naDose=()=>{ const n=naDose(); const pl=planoHoje(); const nome=(S.perfil.nome||"").split(" ")[0];
  const mini=p=>p.dias&&p.dias.length===7?`<span class="pl-mini" aria-hidden="true">${p.dias.map((d,i)=>`<i style="height:${Math.max(3,Math.round(d.h*22))}px;background:${d.c==='transparent'?'var(--s3)':d.c};animation-delay:${i*60}ms${d.hoje?';outline:1.5px solid var(--ember);outline-offset:1px':''}"></i>`).join("")}</span>`:`<span class="pl-bar"><i style="width:${(p.barra??p.pct)!=null?Math.max(4,Math.round((p.barra??p.pct)*100)):0}%;background:${corPct(p.pct)}"></i></span>`;
  return `<div class="hero4 nadose"><button class="hoje-eu" onclick="go('meuperfil')" aria-label="Meu perfil">${window.avatarHTML?avatarHTML('sm'):''}<span><b>${nome?`Olá, ${esc(nome)}`:'Seu perfil'}</b><span class="tiny">${DIAS[pl.dia]} · ${fmtDL(today())}</span></span></button>
    <h2 class="nd-q">Você está na dose?</h2>
    <div class="arco-wrap">${window.arcoSVG(n.score||0,230,n.cor)}<div class="arco-num"><div class="big" ${n.score!=null?`data-count="${n.score}"`:''}>${n.score??"—"}</div><div class="arco-lbl" style="color:${n.cor}">${n.estado}</div></div></div>
    <p class="serif coach" style="text-align:center;margin:4px 0 2px">${esc(n.frase.t)} <i>${esc(n.frase.i)}</i></p>${n.frase.sub?`<div class="tiny" style="text-align:center">${n.frase.sub}</div>`:""}
    <div class="pilares">${n.pilares.map(p=>`<div class="pilar"><button class="pl-top" onclick="ndAbre('${p.k}',this)" aria-expanded="false" aria-controls="nd-${p.k}"><b>${p.nome}</b>${mini(p)}<span class="pl-v">${p.valor}</span></button>
      <div class="pl-det" id="nd-${p.k}" hidden>${p.dias?`<div class="pl-dias">${p.dias.map(d=>`<div class="pl-d${d.hoje?' hoje':''}"><i style="height:${Math.round(d.h*56)}px;background:${d.c};${d.borda?'border:1.5px dashed var(--tx3)':''}"></i>${d.l?`<span>${d.l}</span>`:""}</div>`).join("")}</div>`:""}<p class="small">${esc(p.leitura)}</p><button class="btn sm ghost" style="width:auto" onclick="${p.ir}">${p.irTxt} ›</button></div></div>`).join("")}</div></div>`; };
// Números que contam (respeita "reduzir movimento")
window.animarNumeros=(root)=>{ const red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches; (root||document).querySelectorAll('[data-count]').forEach(el=>{ const fim=+el.dataset.count; if(!isFinite(fim)) return; if(red){ el.textContent=fim; return; } const t0=performance.now(), D=800; const suf=el.dataset.suf||''; const step=t=>{ const k=Math.min(1,(t-t0)/D), e=1-Math.pow(1-k,3); el.textContent=Math.round(fim*e)+suf; if(k<1) requestAnimationFrame(step); }; el.textContent='0'+suf; requestAnimationFrame(step); }); };
window.ndAbre=(k,b)=>{ const el=document.getElementById('nd-'+k); if(!el) return; const ab=el.hidden; document.querySelectorAll('.pl-det').forEach(x=>{ x.hidden=true; }); document.querySelectorAll('.pl-top').forEach(x=>x.setAttribute('aria-expanded','false')); el.hidden=!ab; if(b) b.setAttribute('aria-expanded',String(ab)); };

// ---------- Energia de hoje (o antigo arco "dose") ----------
window.V_energiaTile=()=>{ const d=window.doseHoje(); return `<div class="tile" onclick="sheet(V_energiaInfo())"><div class="tl">Energia de hoje</div><div class="tv">${d.score}</div><div class="ts" style="color:${corDose(d.score)};font-weight:700">${d.feitos&&d.feitos.length?`restante · ${d.nivel}`:d.nivel}</div></div>`; };
window.V_energiaInfo=()=>{ const d=window.doseHoje(); const f=window.fraseHoje(planoHoje(),programa(),d);
  return `<h3>Energia de hoje · ${d.score}</h3><p class="serif">${f.t} <i>${f.i}</i></p><p class="small">${esc(f.sub||"")}</p>
   ${d.feitos&&d.feitos.length?`<div class="feitoHoje" style="justify-content:flex-start">${d.feitos.map(x=>`<span class="chip on">${I("check",14)} ${esc(x.nome)}${x.min?` · ${x.min} min`:""}</span>`).join("")}</div><p class="tiny">Começou o dia em ${d.base}. Já gastou ${d.consumo}.</p>`:""}
   ${(d.why||[]).length?`<div class="list" style="margin-top:8px">${d.why.map(w=>`<div class="item"><div class="t"><b>${esc(w.t||w)}</b>${w.d?`<span>${esc(w.d)}</span>`:""}</div></div>`).join("")}</div>`:""}
   <p class="tiny" style="margin-top:10px">Energia de hoje = como você chega (sono, esforço dos últimos dias, dor) menos o que já gastou hoje. Cada hora de treino gasta 20 (baixa), 30 (média) ou 40 (alta).</p>`; };

// ---------- Card Comunidade na Hoje ----------
window.V_cardCom=()=>`<div class="card com" id="cardCom"><div class="row" style="justify-content:space-between;align-items:baseline"><div class="eyebrow">Comunidade</div><button class="lk" onclick="go('comunidade')">Ver ›</button></div>
  <div id="cardComPos" class="small" style="margin:6px 0 10px">${window.CLOUD&&CLOUD.user()?"carregando…":"Desafie um amigo por 7 dias e veja quem aparece mais."}</div>
  <div class="grid2"><button class="btn em sm" onclick="comModelo('7dias')">Desafiar</button><button class="btn sec sm" onclick="go('comunidade')">Treinar junto</button></div></div>`;
async function preencheCom(){ const el=document.getElementById('cardComPos'); if(!el||!(window.CLOUD&&CLOUD.user())||!window.GRUPOS) return;
  try{ const gs=await GRUPOS.listar(); if(!gs.length){ el.textContent="Nenhum grupo ainda. Desafie alguém por 7 dias: quem treina mais dias ganha."; return; }
    const pos=await GRUPOS.posicoes(gs); const L=Object.values(pos).sort((a,b)=>a.pos/a.n-b.pos/b.n); const m=L[0];
    el.innerHTML=m?`<b class="mono" style="font-size:22px">${m.pos}º</b> de ${m.n} em <b>${esc(m.nome)}</b> na semana${m.acima?` · faltam ${m.acima.dif} pontos para passar ${esc(m.acima.nome)}`:m.pos===1?" · você lidera":""}`:"Seus grupos ainda não têm registros nesta semana."; }
  catch(e){ el.textContent="Não carregou o ranking agora."; } }
window.preencheCom=preencheCom;
const _aH=A.hoje; A.hoje=(p)=>{ if(_aH) _aH(p); preencheCom(); animarNumeros(document.getElementById('view')); };

// ---------- Aba Comunidade ----------
const MODELOS={
  '7dias':{nome:"7 dias",desc:"quem treina mais",tipo:'dias',meta:5,per:'semana',dur:7,ic:'flag'},
  'mes':{nome:"Mês sem falhar",desc:"4 semanas na meta",tipo:'dias',meta:null,per:'semana',dur:28,ic:'calendar'},
  '100km':{nome:"100 km",desc:"em 30 dias",tipo:'km',meta:100,per:'total',dur:30,ic:'heart'}
};
window.comModelo=k=>{ if(!(window.CLOUD&&CLOUD.user())) return garantirConta(()=>comModelo(k),"Para criar o desafio"); const m=MODELOS[k]; gpNovo();
  setTimeout(()=>{ const $=id=>document.getElementById(id); if(!$('gpNome')) return; $('gpNome').value=m.nome; $('gpDesc').value=m.desc; [...$('gpTipo').children].forEach(c=>c.classList.toggle('on',c.dataset.k===m.tipo));
    const meta=m.meta||Math.max(2,Object.values(semanaUsuario()).filter(u=>u&&(u.musc||(u.esportes||[]).length)).length||4); $('gpMeta').value=meta; $('gpPer').value=m.per; $('gpFim').value=shiftData(today(),m.dur-1); },50); };

V.comunidade=(p)=>{ setTitle("Comunidade"); const logado=window.CLOUD&&CLOUD.user();
  return `<h1 class="sec">Comunidade</h1>
   ${window.V_meuHero?V_meuHero():""}
   <div id="comRegiao">${window.V_regiao?V_regiao():""}</div>
   <div class="row" style="justify-content:space-between;align-items:baseline"><h3>Desafios</h3><button class="lk" onclick="gpComoPontua?gpComoPontua():null">Como pontua?</button></div>
   <div class="hscroll">${Object.entries(MODELOS).map(([k,m])=>`<button class="dcard" onclick="comModelo('${k}')"><span class="dc-ic">${I(m.ic,26)}</span><b>${m.nome}</b><span>${m.desc}</span><em>Criar ›</em><svg class="dc-curva" viewBox="0 0 120 40" aria-hidden="true"><path d="M2 38C30 36 40 8 70 6s38 0 48 0" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="70" cy="6" r="3" fill="var(--ember)"/></svg></button>`).join("")}</div>
   <div class="row" style="justify-content:space-between;align-items:baseline"><h3>Seus grupos</h3><span><button class="lk" onclick="gpEntrar('')">Tenho código</button> · <button class="lk" onclick="gpNovo()">Criar</button></span></div>
   <div id="comGrupos">${logado?`<div class="card sub small">carregando…</div>`:`<div class="card sub small">Crie um desafio ou entre com um código.</div>`}</div>`; };
A.comunidade=async()=>{ if(window.A_regiao) A_regiao(); animarNumeros(document.getElementById('comStats')); if(!(window.CLOUD&&CLOUD.user())||!window.GRUPOS) return;
  try{ const gs=await GRUPOS.listar(); const pos=await GRUPOS.posicoes(gs).catch(()=>({}));
    const el=document.getElementById('comGrupos'); if(el) el.innerHTML=gs.length?`<div class="list">${gs.map(g=>{ const q=pos[g.id]; return `<div class="item" onclick="go('grupos',{g:'${g.id}'})"><div class="n">${q?`<b class="mono">${q.pos}º</b>`:I("users")}</div><div class="t"><b>${esc(g.nome)}</b><span>${q?`${q.pos}º de ${q.n} na semana${q.acima?` · faltam ${q.acima.dif} pts para ${esc(q.acima.nome)}`:q.pos===1?' · liderando':''}`:'sem registros na semana'}</span></div><span class="arrow">›</span></div>`; }).join("")}</div>`:`<div class="card sub small">Nenhum grupo ainda. Comece por um desafio acima.</div>`;
    const L=Object.values(pos); const st=document.getElementById('comStats'); if(st){ const mp=L.length?Math.min(...L.map(x=>x.pos)):null; st.querySelector('[data-k="pos"]').innerHTML=mp?`<b data-count="${mp}" data-suf="º">${mp}º</b>`:'<b>—</b>'; st.querySelector('[data-k="gr"]').innerHTML=`<b data-count="${gs.length}">${gs.length}</b>`; animarNumeros(st); } }
  catch(e){ const el=document.getElementById('comGrupos'); if(el) el.innerHTML=`<div class="card"><b>Não carregou</b><p class="small">${esc(e.message)}</p></div>`; } };

// ---------- Check-in enxuto: 4 respostas ----------
const SONO=[["< 6 h",5.5],["6–7 h",6.5],["7–8 h",7.5],["8 h +",8.5]];
const SEM=[["baixa","Baixa","Pouca energia, treinos pesados. Se repetir, o coach sugere uma semana mais leve."],["media","Média","Normal. Segue o plano."],["alta","Alta","Disposição boa. Pode buscar progressão."]];
V._checkin=()=>{ const last=S.checkins[S.checkins.length-1]||{}; const pes=(S.pesagens||[]).filter(x=>x.data>shiftData(today(),-7)); const media=pes.length?Math.round(pes.reduce((a,x)=>a+x.peso,0)/pes.length*10)/10:null;
  const rows=S.checkins.slice(-8).reverse();
  return `<p class="serif coach" style="margin:0 0 10px">Uma vez por semana. <i>Quatro respostas</i>, o resto o app já sabe.</p>
  <div class="card"><input id="ckData" type="hidden" value="${today()}">
   <div class="grid2"><div><label for="ckPeso">Peso (kg)</label><input id="ckPeso" type="number" step="0.1" inputmode="decimal" value="${media??''}" placeholder="${last.peso||''}"><div class="tiny">${media!=null?'média das pesagens da semana':'de manhã, em jejum'}</div></div><div><label for="ckCint">Cintura (cm)</label><input id="ckCint" type="number" step="0.5" inputmode="decimal" placeholder="${last.cintura||''}"><div class="tiny">na altura do umbigo</div></div></div>
   <label>Sono · média por noite</label><div class="seg ck" id="ckSonoSeg">${SONO.map(([l,v])=>`<button type="button" data-v="${v}" onclick="ckPick('ckSonoSeg',this)">${l}</button>`).join("")}</div>
   <label>Como foi a semana</label><div class="seg ck intens" id="ckSemSeg">${SEM.map(([k,l,d])=>`<button type="button" data-v="${k}" data-d="${esc(d)}" onclick="ckPick('ckSemSeg',this)">${l}</button>`).join("")}</div><div class="tiny" id="ckSemTxt" style="min-height:18px"></div>
  </div>
  <details class="card"><summary><b>Mais medidas</b> <span class="tiny">· opcional</span></summary>
   <div class="grid3" style="margin-top:8px"><div><label>Peito cm</label><input id="ckPeito" type="number" step="0.5"></div><div><label>Braço cm</label><input id="ckBraco" type="number" step="0.5"></div><div><label>Coxa cm</label><input id="ckCoxa" type="number" step="0.5"></div></div>
   <div class="grid3"><div><label>Passos/dia</label><input id="ckPassos" type="number"></div><div><label>FC repouso</label><input id="ckFcr" type="number"></div><div><label>HRV (ms)</label><input id="ckHrv" type="number"></div></div>
   <label>Notas da semana</label><textarea id="ckNotas" rows="2"></textarea></details>
  <button class="btn em" onclick="salvaCheckin()">Salvar check-in</button>
  ${rows.length?`<div class="card" style="margin-top:12px"><b>Últimos</b><div class="tablewrap"><table><tr><th>Data</th><th class="num">Peso</th><th class="num">Cint.</th><th class="num">Sono</th><th class="num">Semana</th></tr>${rows.map(r=>`<tr><td>${fmtD(r.data)}</td><td class="num mono">${r.peso??"—"}</td><td class="num mono">${r.cintura??"—"}</td><td class="num mono">${r.sono??"—"}</td><td class="num">${r.semana?({baixa:'Baixa',media:'Média',alta:'Alta'})[r.semana]:"—"}</td></tr>`).join("")}</table></div></div>`:""}`; };
window.ckPick=(id,b)=>{ document.querySelectorAll('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b)); if(id==='ckSemSeg'){ const t=document.getElementById('ckSemTxt'); if(t) t.textContent=b.dataset.d||""; } };
window.salvaCheckin=()=>{ const v=id=>{ const el=document.getElementById(id); return el?num(el.value):null; }; const on=id=>document.querySelector('#'+id+' button.on');
  const so=on('ckSonoSeg'), se=on('ckSemSeg'); const sem=se?se.dataset.v:null;
  const ck={id:uid(),data:(document.getElementById('ckData')||{}).value||today(),peso:v('ckPeso'),cintura:v('ckCint'),peito:v('ckPeito'),braco:v('ckBraco'),coxa:v('ckCoxa'),sono:so?num(so.dataset.v):null,passos:v('ckPassos'),fcrep:v('ckFcr'),hrv:v('ckHrv'),semana:sem,energia:sem?({baixa:3,media:6,alta:9})[sem]:null,fadiga:sem?({baixa:7,media:4,alta:2})[sem]:null,notas:((document.getElementById('ckNotas')||{}).value||"")};
  if(ck.peso==null&&ck.cintura==null&&ck.sono==null&&!sem) return toast("Responda pelo menos uma das quatro");
  const ex=S.checkins.find(x=>x.data===ck.data); if(ex) Object.keys(ck).forEach(k=>{ if(ck[k]!=null&&ck[k]!==""&&k!=='id') ex[k]=ck[k]; }); else S.checkins.push(ck);
  S.checkins.sort((a,b)=>a.data.localeCompare(b.data)); if(ck.peso) S.perfil.peso=ck.peso; save(); toast("Check-in salvo"); go('progresso'); };

// ---------- Progresso sem caixas vazias ----------
const _prog=V.progresso; V.progresso=(p)=>{ let h=_prog(p); const t=p.t||"painel"; if(t!=="painel") return h;
  const antes=h; h=h.replace(/<div class="card sub small">[^<]*<\/div>/g,"").replace(/<div class="card"><b>Dor articular[^]*?Sem dor registrada[^]*?<\/p><\/div>/,"");
  if(h!==antes&&!/<canvas/.test(h)){ const g=p.g||"corpo"; const dica={corpo:"Pese-se de manhã (Nutrição › Peso) e faça o check-in: a curva aparece com 2 registros.",treino:"Termine um treino e a evolução aparece aqui.",cardio:"Registre um cardio ou conecte o Strava.",nutri:"Registre refeições no diário para ver os dias na meta."}[g]||""; h+=`<p class="serif" style="margin-top:18px">Ainda sem dado aqui. <i>${dica}</i></p>`; }
  return h; };
})();

// ================= DOSE · onboarding v2 =================
// Fluxo: você → metas → sua semana (esportes e musculação por dia) → nível e lugar → treino DOSE montado → nutrição (macros editáveis).
(function(){
const V=window.VIEWS, A=window.AFTER;
const DS=[["seg","Seg"],["ter","Ter"],["qua","Qua"],["qui","Qui"],["sex","Sex"],["sab","Sáb"],["dom","Dom"]];
const ESPORTES=[["musc","Musculação","strength"],["bjj","Jiu-Jitsu","bjj"],["corrida","Corrida","run"],["boxe","Boxe / luta em pé","box"],["futebol","Futebol","football"],["natacao","Natação","swim"],["hyrox","Hyrox","hyrox"],["ciclismo","Bike","bike"],["tenis","Tênis / beach tennis","tennis"],["outro","Outro esporte","star"]];
const EXP=[["nunca","Nunca treinei"],["iniciante","Comecei há pouco (menos de 1 ano)"],["intermediario","Treino há 1–3 anos"],["avancado","Treino há mais de 3 anos"],["atleta","Compito"]];
const TOTAL=6;
S.ob=S.ob||{}; // rascunho do onboarding

const bar=i=>`<div class="steps">${Array.from({length:TOTAL},(_,k)=>`<i class="${k<=i?'on':''}"></i>`).join("")}</div>`;
const foot=(i,next,label)=>`<div class="foot">${i>0?`<button class="btn ghost" style="width:auto" onclick="go('onboard',{i:${i-1}})">‹</button>`:""}<button class="btn em" style="flex:1" onclick="${next}">${label||"Continuar"}</button></div>`;
const v=id=>{ const el=document.getElementById(id); return el?el.value:""; };
const n=id=>{ const x=parseFloat(String(v(id)).replace(',','.')); return isNaN(x)?null:x; };

const steps=[
 // 0 — boas-vindas
 ()=>`<div class="wiz"><div class="body" style="display:flex;flex-direction:column;justify-content:center"><div class="eyebrow">Bem-vindo</div><div style="margin:14px 0;color:var(--ember)">${I('dose',64)}</div><h1 style="font-size:44px">A dose certa.</h1><p class="serif" style="margin-top:10px">O corpo responde ao estímulo certo, na quantidade certa, repetido por tempo suficiente. Mais não é melhor. Melhor é melhor.</p><p class="small muted" style="margin-top:14px">Em 2 minutos: quem você é, aonde quer chegar, sua semana — e o DOSE monta seu treino e suas metas.</p></div>${foot(0,"go('onboard',{i:1})","Começar")}<button class="btn ghost" style="margin-top:10px" onclick="S.onboarded=true;save();go('hoje')">Pular e explorar</button><p class="tiny" style="text-align:center;margin-top:14px">Conteúdo educativo; não substitui médico, nutricionista ou profissional de educação física. Ao usar, você aceita os <a href="termos.html" target="_blank" rel="noopener">Termos</a> e a <a href="privacidade.html" target="_blank" rel="noopener">Privacidade</a>.</p></div>`,
 // 1 — você
 ()=>{ const p=S.perfil; return `<div class="wiz">${bar(1)}<div class="body"><div class="eyebrow">1 · Você</div><h1>Quem treina</h1><p class="small muted">Só o necessário para calcular. Fica no seu aparelho.</p>
  <label>Como quer ser chamado</label><input id="obNome" value="${esc(p.nome||"")}" placeholder="Primeiro nome" autocomplete="given-name">
  <div class="grid3"><div><label>Sexo</label><select id="obSexo"><option value="m" ${p.sexo==='m'?'selected':''}>Homem</option><option value="f" ${p.sexo==='f'?'selected':''}>Mulher</option></select></div><div><label>Idade</label><input id="obIdade" type="number" inputmode="numeric" value="${p.idade??''}" placeholder="anos"></div><div><label>Altura</label><input id="obAlt" type="number" inputmode="numeric" value="${p.altura??''}" placeholder="cm"></div></div>
  <div class="grid2"><div><label>Peso hoje</label><input id="obPeso" type="number" inputmode="decimal" step="0.1" value="${p.peso??''}" placeholder="kg"></div><div><label>% de gordura (se souber)</label><input id="obBf" type="number" inputmode="decimal" step="0.5" value="${p.bf??''}" placeholder="opcional"></div></div>
  </div>${foot(1,"obSalvar1()")}</div>`; },
 // 2 — metas
 ()=>{ const p=S.perfil; return `<div class="wiz">${bar(2)}<div class="body"><div class="eyebrow">2 · Metas</div><h1>Aonde quer chegar</h1><p class="small muted">Metas são bússola, não prazo. O DOSE ajusta a semana para chegar lá sem queimar etapa.</p>
  <div class="grid2"><div><label>Peso que quer ter</label><input id="obPesoAlvo" type="number" inputmode="decimal" step="0.1" value="${p.pesoAlvo??''}" placeholder="kg (opcional)"></div><div><label>% de gordura que quer ter</label><input id="obBfAlvo" type="number" inputmode="decimal" step="0.5" value="${p.bfAlvo??''}" placeholder="opcional"></div></div>
  <label>Meta no esporte ou no treino</label><input id="obMeta" value="${esc(p.metaEsporte||"")}" placeholder="Ex.: competir em junho, correr 10 km, supino 100 kg">
  <p class="tiny" style="margin-top:12px">Se o peso-alvo for menor que o atual, a nutrição começa em déficit; se for maior, em superávit leve. Você pode mudar no fim.</p>
  </div>${foot(2,"obSalvar2()")}</div>`; },
 // 3 — sua semana
 ()=>{ const ob=S.ob; ob.esportes=ob.esportes||Object.assign({musc:S.perfil.diasMusc||[]},S.perfil.esportes||{}); const sel=Object.keys(ob.esportes);
  return `<div class="wiz">${bar(3)}<div class="body"><div class="eyebrow">3 · Sua semana</div><h1>O que você pratica</h1><p class="small muted">Toque no que faz e marque os dias. Musculação é um deles — o DOSE monta o treino nos dias que sobrarem para ela.</p>
  <div class="chips" style="margin-top:8px">${ESPORTES.map(([k,nm,ic])=>`<span class="chip ${sel.includes(k)?'on':''}" onclick="obToggleEsporte('${k}')">${I(ic)} ${nm}</span>`).join("")}</div>
  ${sel.map(k=>{ const e=ESPORTES.find(x=>x[0]===k)||[k,k,'star']; const dias=ob.esportes[k]||[]; return `<div class="card sub" style="padding:12px 14px"><div class="row"><b>${I(e[2])} ${e[1]}</b><span class="tiny">${dias.length} dia${dias.length===1?'':'s'}</span></div><div class="dayrow">${DS.map(([d,l])=>`<div class="d ${dias.includes(d)?'on':''}" onclick="obToggleDia('${k}','${d}')"><b>${l}</b>${dias.includes(d)?I('check',14):'<span style="height:14px"></span>'}</div>`).join("")}</div></div>`; }).join("")}
  </div>${foot(3,"obSalvar3()")}</div>`; },
 // 4 — nível e lugar
 ()=>{ const p=S.perfil; return `<div class="wiz">${bar(4)}<div class="body"><div class="eyebrow">4 · Nível e lugar</div><h1>Como você treina</h1>
  <h3>Experiência com musculação</h3><div class="chips">${EXP.map(([k,nm])=>`<span class="chip ${(p.experiencia||'intermediario')===k?'on':''}" onclick="S.perfil.experiencia='${k}';save();route()">${nm}</span>`).join("")}</div>
  <h3>Onde treina</h3><div class="chips">${Object.entries(MODOS).map(([k,nm])=>`<span class="chip ${p.modo===k?'on':''}" onclick="S.perfil.modo='${k}';save();route()">${nm}</span>`).join("")}</div>
  <h3>Alguma dor que limita?</h3><div class="chips"><span class="chip ${p.cotovelo?'on':''}" onclick="S.perfil.cotovelo=!S.perfil.cotovelo;save();route()">Cotovelo / antebraço</span><span class="chip ${p.joelho?'on':''}" onclick="S.perfil.joelho=!S.perfil.joelho;save();route()">Joelho</span></div><p class="tiny">Dor marcada tira ou adapta exercícios de risco. Dor aguda ou persistente é caso de médico ou fisioterapeuta, não de app.</p>
  </div>${foot(4,"obMontar()","Montar meu treino DOSE")}</div>`; },
 // 5 — treino montado + nutrição
 ()=>{ const p=S.perfil; const g=S.gerado; const nu=calcNutri(p); const pc=p.protocoloCoach||{}; const k=pc.kcal||nu?.alvo, pr=pc.p||nu?.prot, c=pc.c||nu?.carb, gd=pc.g||nu?.gord;
  return `<div class="wiz">${bar(5)}<div class="body"><div class="eyebrow">5 · Seu DOSE</div><h1>Pronto para começar</h1>
  ${g?`<div class="card hero"><b>${esc(g.nome)}</b><p class="small" style="margin-top:6px">${g.rotacao.length} sessões em rotação: ${g.rotacao.map(x=>g.sessoes[x].nome).join(" · ")}. ${(S.perfil.diasMusc||[]).length?`Nos dias ${S.perfil.diasMusc.map(d=>DS.find(x=>x[0]===d)[1]).join(", ")}.`:""}</p><p class="tiny">${esc(g.principios[0]||"")}</p></div>`:`<div class="card"><b>Sem dias de musculação marcados</b><p class="small">Você pode montar depois em Treino → Montar programa.</p></div>`}
  <h3>Nutrição</h3><label>Objetivo</label><select id="obObj" onchange="S.perfil.objetivo=this.value;S.perfil.protocoloCoach={kcal:null,p:null,c:null,g:null,fonte:''};save();route()">${window.NUTRI.objetivos.map(o=>`<option value="${o.k}" ${p.objetivo===o.k?'selected':''}>${o.n}</option>`).join("")}</select>
  ${nu?`<p class="small muted">Calculado de forma conservadora${nu.fator.capped?' (como "3–4 treinos por semana", mesmo você treinando mais)':''}: gasto ${nu.tdee} kcal → alvo ${nu.alvo} kcal. Ajuste se quiser; o que você digitar vale.</p>
  <div class="grid2"><div><label>Calorias / dia</label><input id="obK" type="number" inputmode="numeric" value="${k}"></div><div><label>Proteína g</label><input id="obP" type="number" inputmode="numeric" value="${pr}"></div></div>
  <div class="grid2"><div><label>Carboidrato g</label><input id="obC" type="number" inputmode="numeric" value="${c}"></div><div><label>Gordura g</label><input id="obG" type="number" inputmode="numeric" value="${gd}"></div></div>
  <p class="tiny">Proteína mínima sugerida: ${nu.prot} g (${(nu.prot/p.peso).toFixed(1)} g/kg). Abaixo da TMB (${nu.tmb} kcal) o app avisa.</p>`:`<p class="small muted">Preencha idade, altura e peso na etapa 1 para calcular.</p>`}
  </div>${foot(5,"obFinalizar()","Entrar no DOSE")}</div>`; }
];

V.onboard=()=>{ setTitle("Começar"); const i=Math.min(TOTAL-1,Math.max(0,+(R.p.i||0))); return steps[i](); };
A.onboard=()=>{ window.scrollTo(0,0); };

window.obSalvar1=()=>{ const p=S.perfil; p.nome=v('obNome').trim(); p.sexo=v('obSexo'); p.idade=n('obIdade'); p.altura=n('obAlt'); p.peso=n('obPeso'); p.bf=n('obBf'); if(!p.idade||!p.altura||!p.peso){ toast("Idade, altura e peso são necessários"); return; } if(p.peso) S.pesagens=S.pesagens||[]; save(); go('onboard',{i:2}); };
window.obSalvar2=()=>{ const p=S.perfil; p.pesoAlvo=n('obPesoAlvo'); p.bfAlvo=n('obBfAlvo'); p.metaEsporte=v('obMeta').trim();
  if(p.pesoAlvo&&p.peso){ const d=(p.pesoAlvo-p.peso)/p.peso; p.objetivo=d<-0.08?"cut":d<-0.02?"cutLeve":d<0.02?(p.bfAlvo&&p.bf&&p.bfAlvo<p.bf?"recomp":"manter"):d<0.06?"bulkLeve":"bulk"; }
  save(); go('onboard',{i:3}); };
window.obToggleEsporte=(k)=>{ const e=S.ob.esportes; if(e[k]) delete e[k]; else e[k]=[]; save(); route(); };
window.obToggleDia=(k,d)=>{ const e=S.ob.esportes; const a=e[k]||[]; e[k]=a.includes(d)?a.filter(x=>x!==d):[...a,d]; save(); route(); };
window.obSalvar3=()=>{ const e=S.ob.esportes||{}; const p=S.perfil; p.diasMusc=(e.musc||[]).slice(); p.esportes={}; Object.entries(e).forEach(([k,dias])=>{ if(k!=='musc'&&dias.length) p.esportes[k]=dias.slice(); });
  const nTotal=p.diasMusc.length+Object.values(p.esportes).reduce((a,x)=>a+x.length,0); p.atividade=nTotal<=0?"sed":nTotal<=2?"leve":nTotal<=4?"mod":nTotal<=7?"alto":"muito";
  const esp=Object.keys(p.esportes); p.esporteFoco=esp[0]||""; save(); go('onboard',{i:4}); };
window.obMontar=()=>{ const p=S.perfil; const dias=(p.diasMusc||[]).length; if(!dias){ S.gerado=null; save(); go('onboard',{i:5}); return; }
  const esp=Object.keys(p.esportes||{}); const diasEsp=[...new Set(Object.values(p.esportes||{}).flat())];
  let obj="hipertrofia"; if(["cut","cutLeve"].includes(p.objetivo)) obj="emagrecer"; else if(p.objetivo==="recomp") obj="hipertrofia"; if(esp.some(x=>["bjj","boxe","futebol","hyrox"].includes(x))&&dias<=3) obj=["cut","cutLeve"].includes(p.objetivo)?"emagrecer":"potencia"; if(p.experiencia==="nunca") obj="geral"; if(p.idade>=50&&p.experiencia!=="atleta") obj=obj==="hipertrofia"?"saude":obj;
  const pri=[]; if(p.sexo==='f') pri.push("gluteo"); if(esp.includes("bjj")||esp.includes("boxe")) pri.push("costas"); if(esp.includes("corrida")||esp.includes("futebol")) pri.push("pernas"); if(!pri.length) pri.push("ombro","costas");
  const cfg={objetivoTreino:obj,dias:Math.min(6,Math.max(2,dias)),experiencia:p.experiencia||"intermediario",prioridades:pri.slice(0,3),diasBjj:diasEsp,diasMusc:p.diasMusc,preferSplit:dias>=5?"ppl":"ul",modo:p.modo,cotovelo:p.cotovelo,joelho:p.joelho};
  S.gerador=cfg; S.gerado=window.gerarPrograma(cfg); window.PROGRAMS.gerado=S.gerado; S.rotacao.gerado=0; p.programa="gerado"; save(); go('onboard',{i:5}); };
window.obFinalizar=()=>{ const p=S.perfil; const k=n('obK'),pr=n('obP'),c=n('obC'),g=n('obG'); const nu=calcNutri(p);
  if(nu&&k&&pr){ const igual=k===nu.alvo&&pr===nu.prot&&c===nu.carb&&g===nu.gord; p.protocoloCoach=igual?{kcal:null,p:null,c:null,g:null,fonte:""}:{kcal:k,p:pr,c:c||0,g:g||0,fonte:"você"}; if(k<nu.tmb) toast("Abaixo da TMB: cuidado"); }
  S.onboarded=true; delete S.ob; save(); toast(p.nome?`Bora, ${p.nome.split(' ')[0]}.`:"Bora."); go('hoje'); };
})();

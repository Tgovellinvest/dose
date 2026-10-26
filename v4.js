// ================= DOSE v4 · linguagem visual (referências: Oura, Gentler Streak, Fitbod, Hevy) =================
// Hoje: arco com um número, frase em serifa, tiles de duas colunas, mapa do corpo (recuperação), caminho da semana (banda suave).
(function(){
const V=window.VIEWS, A=window.AFTER;
const DIASEM=["seg","ter","qua","qui","sex","sab","dom"]; const DN={seg:"S",ter:"T",qua:"Q",qui:"Q",sex:"S",sab:"S",dom:"D"};
const corDose=s=>s>=85?"var(--ok)":s>=65?"var(--tx)":s>=45?"var(--warn)":"var(--stop)";

// ---- Arco (gauge) 0–100
window.arcoSVG=(v,size=220,cor="var(--tx)")=>{ const r=92, c=Math.PI*r; const pct=Math.max(0,Math.min(100,v))/100; return `<svg class="arco" viewBox="0 0 220 130"><path d="M18 118 A92 92 0 0 1 202 118" fill="none" stroke="var(--s3)" stroke-width="10" stroke-linecap="round"/><path class="arco-v" d="M18 118 A92 92 0 0 1 202 118" fill="none" stroke="${cor}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pct)}"/><circle class="arco-dot" r="6" fill="var(--ember)" cx="${110-92*Math.cos(Math.PI*pct)}" cy="${118-92*Math.sin(Math.PI*pct)}"/></svg>`; };

// ---- Corpo: silhueta abstrata (frente e costas) com regiões coloridas pela recuperação
const FRONT={Ombro:[[31,42,13],[89,42,13]],Peitoral:[[47,52,16,13],[73,52,16,13]],Bíceps:[[26,64,9,16],[94,64,9,16]],Abdômen:[[60,76,14,20]],Core:[[60,76,14,20]],Quadríceps:[[48,116,12,26],[72,116,12,26]],Panturrilha:[[48,160,9,18],[72,160,9,18]]};
const BACK={Trapézio:[[60,42,22,10]],Dorsal:[[46,62,15,18],[74,62,15,18]],Tríceps:[[26,64,9,16],[94,64,9,16]],Glúteo:[[49,98,12,11],[71,98,12,11]],Posterior:[[48,124,12,24],[72,124,12,24]],Panturrilha:[[48,160,9,18],[72,160,9,18]]};
function corpo(map,st){ const cor={recuperando:"var(--warn)",pronto:"var(--ok)",fresco:"var(--tx3)"}; const base=`<circle cx="60" cy="18" r="11" fill="var(--s3)"/><path d="M38 34h44l10 40-8 2-4-24v36l6 70h-12l-8-56-8 56H44l6-70V52l-4 24-8-2z" fill="var(--s3)"/>`;
  const regs=Object.entries(map).map(([g,shapes])=>{ const s=st[g]||"fresco"; return shapes.map(sh=>{ const op=s==="fresco"?.55:1; return sh.length===3?`<circle cx="${sh[0]}" cy="${sh[1]}" r="${sh[2]}" fill="${cor[s]}" opacity="${op}"/>`:`<ellipse cx="${sh[0]}" cy="${sh[1]}" rx="${sh[2]}" ry="${sh[3]}" fill="${cor[s]}" opacity="${op}"/>`; }).join(""); }).join("");
  return `<svg viewBox="0 0 120 190" class="corpo">${base}${regs}</svg>`; }
window.V_corpo=function(){ const m=window.mapaRecuperacao(); const st={}; m.forEach(x=>st[x.g]=x.st); const rec=m.filter(x=>x.st==="recuperando").map(x=>x.g); const pronto=m.filter(x=>x.st==="pronto").map(x=>x.g);
  return `<div class="card"><div class="row" style="justify-content:space-between;align-items:baseline"><b>Recuperação</b><span class="tiny">48 h = pronto</span></div>
   <div class="row" style="gap:18px;align-items:center;margin-top:8px"><div class="corpos">${corpo(FRONT,st)}${corpo(BACK,st)}</div><div style="flex:1;min-width:0"><div class="small"><i class="dot" style="background:var(--warn)"></i> ${rec.length?esc(rec.join(", ")):"nada em recuperação"}</div><div class="small" style="margin-top:6px"><i class="dot" style="background:var(--ok)"></i> ${pronto.length?esc(pronto.join(", ")):"—"}</div><div class="tiny" style="margin-top:6px">Laranja: treinado há menos de 48 h. Verde: pronto. Cinza: fresco.</div></div></div></div>`; };

// ---- Caminho da semana (14 dias): banda suave = carga do dia; linha pontilhada = média
function cargaDia(d){ const s=S.logs.filter(l=>l.data===d).reduce((a,l)=>a+l.sets.filter(x=>x.done).length,0); const c=S.cardio.filter(x=>x.data===d).reduce((a,x)=>a+(x.min||0)/4,0); const e=S.bjj.filter(x=>x.data===d).reduce((a,x)=>a+(x.min||0)/4,0); return s+c+e; }
window.V_caminho=function(){ const dias=[]; for(let i=13;i>=0;i--){ const x=new Date(); x.setDate(x.getDate()-i); dias.push(x.toISOString().slice(0,10)); } const vals=dias.map(cargaDia); const max=Math.max(10,...vals); const W=320,H=90,pad=6; const pts=vals.map((v,i)=>[pad+i*(W-2*pad)/13, H-8-(v/max)*(H-24)]);
  const path=pts.map((p,i)=>{ if(!i) return `M${p[0]},${p[1]}`; const a=pts[i-1]; const cx=(a[0]+p[0])/2; return `C${cx},${a[1]} ${cx},${p[1]} ${p[0]},${p[1]}`; }).join(" "); const area=`${path} L${pts[pts.length-1][0]},${H} L${pts[0][0]},${H} Z`; const media=vals.reduce((a,b)=>a+b,0)/vals.length; const ym=H-8-(media/max)*(H-24);
  const total=vals.reduce((a,b)=>a+b,0); const ativos=vals.filter(v=>v>0).length;
  return `<div class="card"><div class="row" style="justify-content:space-between;align-items:baseline"><b>Caminho · 14 dias</b><span class="tiny">${ativos} dias ativos</span></div>
   <svg viewBox="0 0 ${W} ${H}" class="caminho"><defs><linearGradient id="gcam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--bone)" stop-opacity=".55"/><stop offset="1" stop-color="var(--bone)" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#gcam)"/><path d="${path}" fill="none" stroke="var(--bone)" stroke-width="2.2" stroke-linejoin="round"/><line x1="${pad}" x2="${W-pad}" y1="${ym}" y2="${ym}" stroke="var(--tx3)" stroke-dasharray="3 4"/><circle cx="${pts[13][0]}" cy="${pts[13][1]}" r="4.5" fill="var(--ember)"/></svg>
   <div class="row" style="justify-content:space-between"><span class="tiny">${fmtD(dias[0])}</span><span class="tiny">hoje</span></div></div>`; };

// ---- Frase do dia: segue a situação da pessoa, nunca genérica
window.fraseHoje=function(pl,p,d){ const hoje=today(); const feitoHoje=S.logs.filter(l=>l.data===hoje); const espHoje=[...S.bjj,...S.cardio].filter(x=>x.data===hoje); const prox=proximaSessaoId(); const ps=p.sessoes[prox]; const temHist=S.logs.length>0;
  if(feitoHoje.length){ const n=feitoHoje.reduce((a,l)=>a+l.sets.filter(x=>x.done).length,0); return {t:`Sessão de hoje feita: ${n} séries.`,i:"Agora é comida, água e sono.",sub:`${esc(feitoHoje[0].nome)} registrada`}; }
  if(!temHist){ return {t:"Primeira sessão no DOSE.",i:"Carga confortável, técnica limpa, registre tudo.",sub:"A partir da segunda, o app passa a sugerir a carga"}; }
  if(!pl.sessao&&pl.dia==="dom"){ return {t:"Domingo é recuperação.",i:"Sono, comida, passos leves.",sub:`Próxima da rotação: ${esc(ps.nome)}`}; }
  if(!pl.sessao&&(pl.esportes||[]).length){ return {t:`Hoje é dia de ${esc((window.SPORTS.find(x=>x.id===pl.esportes[0])||{}).nome||"esporte")}.`,i:"Musculação fica para o próximo dia marcado.",sub:`Próxima da rotação: ${esc(ps.nome)}`}; }
  if(d.nivel==="leve"||d.nivel==="reduzida"){ return {t:d.nivel==="leve"?"Hoje a dose é leve.":"Hoje a dose é reduzida.",i:d.nivel==="leve"?"Sessão curta ou descanso ativo; nada de falha.":"Mantenha a carga, corte uma série por exercício.",sub:d.why.slice(0,2).map(w=>esc(w.t)).join(" · ")}; }
  // dose cheia/normal com histórico: aponta o composto principal e a carga da última vez
  const slot=ps.slots[0]; const ex=slot?resolveEx(slot.ex):null; const ult=ex?S.pesos[ex.id]:null;
  if(ex&&ult&&ult.peso){ const topo=parseInt(String(slot.reps).split(/[–-]/).pop())||null; const meta=ult.allTop?`${Math.round((ult.peso+2.5)*10)/10} kg`:`${ult.reps+1} reps`; return {t:`${esc(ex.nome.split(" (")[0])}: ${ult.peso} kg × ${ult.reps} na última.`,i:d.nivel==="cheia"?`Hoje busca ${meta}.`:"Hoje repete e fecha a faixa.",sub:`${esc(ps.nome)} · ${ps.slots.length} exercícios`}; }
  return {t:`${esc(ps.nome)} é a próxima.`,i:d.nivel==="cheia"?"Dia de progredir no composto principal.":"Dose planejada, sem prova.",sub:d.why.slice(0,2).map(w=>esc(w.t)).join(" · ")}; };
// ---- Adicionar alimento: busca sem acento, categorias e recentes
const norm=t=>String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const recentes=()=>{ const vist=new Set(), out=[]; (S.diario||[]).slice().reverse().forEach(x=>{ if(vist.has(x.nome)) return; vist.add(x.nome); const f=window.FOODS.find(y=>y.n===x.nome); if(f) out.push(f); }); return out.slice(0,8); };
const linhaF=f=>`<div class="item" onclick="pickFood('${esc(f.n).replace(/'/g,"\\'")}')"><div class="t"><b>${esc(f.n)}</b><span>${esc(f.u)} · ${f.k} kcal · P ${f.p} · C ${f.c} · G ${f.g}</span></div><span class="arrow">+</span></div>`;
V._addFood=(d)=>{ const rec=recentes(); return `<h2>Adicionar</h2><input id="fdQ" placeholder="Buscar entre ${window.FOODS.length} alimentos (ex.: frango, pão, açaí)" oninput="filtraFood()" autocomplete="off">
  <div class="chips" id="fdCat" style="margin-top:8px;flex-wrap:nowrap;overflow-x:auto">${["Recentes","Marcas",...window.FOOD_CATS.filter(c=>!/^Marcas/.test(c))].map((c,i)=>`<button class="chip ${i===0&&rec.length?'on':''}" data-c="${esc(c)}" onclick="[...fdCat.children].forEach(x=>x.classList.toggle('on',x===this&&!this.classList.contains('on')));filtraFood()">${esc(c)}</button>`).join("")}</div>
  <div class="chips" id="fdSub" style="margin-top:6px;flex-wrap:nowrap;overflow-x:auto;display:none"></div>
  <div id="fdList" class="list" style="margin-top:8px;max-height:44dvh;overflow:auto">${(rec.length?rec:window.FOODS.slice(0,15)).map(linhaF).join("")}</div>
  <div class="sep"></div><details><summary>Não achou? Lançar manual</summary><input id="fdNome" placeholder="Nome" style="margin-top:8px"><div class="grid2"><div><label>kcal</label><input id="fdK" type="number"></div><div><label>Proteína g</label><input id="fdP" type="number"></div></div><div class="grid2"><div><label>Carboidrato g</label><input id="fdC" type="number"></div><div><label>Gordura g</label><input id="fdG" type="number"></div></div><button class="btn sec" style="margin-top:10px" onclick="addFoodManual('${d}')">Lançar</button></details>
  <p class="tiny" style="margin-top:8px">Genéricos: médias da TACO (Unicamp) e USDA. Marcas: rótulos do Open Food Facts (porção típica de rótulo por tipo); confira a embalagem, receitas mudam.</p>`; };
window.filtraFood=()=>{ const q=norm((document.getElementById('fdQ')||{}).value||""); const on=document.querySelector('#fdCat .on'); const c=on?on.dataset.c:"";
  const sub=document.getElementById('fdSub'); if(sub){ if(c==="Marcas"){ if(!sub.children.length) sub.innerHTML=window.FOOD_CATS.filter(x=>/^Marcas · /.test(x)).sort().map(x=>`<button class="chip" data-c="${esc(x)}" onclick="[...fdSub.children].forEach(y=>y.classList.toggle('on',y===this&&!this.classList.contains('on')));filtraFood()">${esc(x.replace('Marcas · ',''))}</button>`).join(""); sub.style.display='flex'; } else { sub.style.display='none'; sub.innerHTML=''; } }
  const so=document.querySelector('#fdSub .on'); const sc=so?so.dataset.c:""; let L;
  if(c==="Recentes"&&!q) L=recentes(); else { const ws=q.split(/\s+/).filter(Boolean); L=window.FOODS.filter(f=>(!c||c==="Recentes"||f.cat===c||(c==="Marcas"&&/^Marcas/.test(f.cat||"")&&(!sc||f.cat===sc)))&&ws.every(w=>(f._n||(f._n=norm(f.n))).includes(w))); if(q) L.sort((a,b)=>(a._n.startsWith(q)?0:1)-(b._n.startsWith(q)?0:1)||a.n.length-b.n.length); }
  const tot=L.length; document.getElementById('fdList').innerHTML=L.slice(0,60).map(linhaF).join("")+(tot>60?`<p class="tiny" style="padding:8px 4px">Mostrando 60 de ${tot}. Digite mais para refinar (ex.: marca, sabor).</p>`:"")||'<p class="muted small">Nada encontrado. Use "Lançar manual" abaixo.</p>'; };
// ---- Porção ou gramas
const baseG=u=>{ const m=String(u).match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i); return m?{q:parseFloat(m[1].replace(',','.')),un:m[2].toLowerCase()}:null; };
window.pickFood=(nome)=>{ const f=window.FOODS.find(x=>x.n===nome); if(!f) return; const b=baseG(f.u);
  document.getElementById('sheetBody').innerHTML=`<h2>${esc(f.n)}</h2><p class="muted small">Porção de referência: ${esc(f.u)} = ${f.k} kcal · P ${f.p} · C ${f.c} · G ${f.g}</p>
  <div class="grid2"><div><label>Porções</label><input id="fdMult" type="number" step="0.25" min="0" value="1" inputmode="decimal" oninput="fdSync('m')"></div>${b?`<div><label>Ou em ${b.un}</label><input id="fdGr" type="number" step="5" min="0" value="${b.q}" inputmode="decimal" oninput="fdSync('g')"></div>`:''}</div>
  <p class="mono" id="fdPrev" style="margin-top:8px">${f.k} kcal</p>
  <div class="grid2" style="margin-top:12px"><button class="btn ghost" onclick="sheet(V._addFood(R.p.d||today()))">‹ Voltar</button><button class="btn em" onclick="addFood('${esc(f.n).replace(/'/g,"\\'")}')">Adicionar</button></div>`;
  window._fdCur=f; };
window.fdSync=(o)=>{ const f=window._fdCur; if(!f) return; const b=baseG(f.u); const mi=document.getElementById('fdMult'), gi=document.getElementById('fdGr');
  if(o==='g'&&b&&gi){ mi.value=+(num(gi.value)/b.q).toFixed(2); } else if(b&&gi){ gi.value=Math.round(num(mi.value)*b.q); }
  const m=num(mi.value)||0; document.getElementById('fdPrev').textContent=`${Math.round(f.k*m)} kcal · P ${Math.round(f.p*m)} · C ${Math.round(f.c*m)} · G ${Math.round(f.g*m)}`; };
window.addFood=(nome)=>{ const f=window.FOODS.find(x=>x.n===nome); if(!f) return; const m=num(document.getElementById('fdMult').value)||1; const b=baseG(f.u); const d=R.p.d||today();
  const qtd=b&&m!==1?`${Math.round(m*b.q)} ${b.un}`:`${m}× ${f.u}`;
  S.diario.push({id:uid(),data:d,per:S._per||"almoco",nome:f.n,qtd,k:f.k*m,p:f.p*m,c:f.c*m,g:f.g*m}); save(); closeSheet(); toast("Adicionado"); go('nutricao',{d}); };
// ---- HOJE
V.hoje=()=>{ setTitle("Hoje"); const pl=planoHoje(); const p=programa(); const d=window.doseHoje(); const vol=volumeSemana(); const alvoTot=Object.values(ALVO).reduce((a,[x,y])=>a+y,0); const volTot=Object.entries(ALVO).reduce((a,[g])=>a+Math.min(vol[g]||0,ALVO[g][1]),0); const pct=Math.round(volTot/alvoTot*100);
  const sessSem=S.logs.filter(l=>l.data>=semanaIni()).length, espSem=S.bjj.filter(l=>l.data>=semanaIni()).length, cardSem=S.cardio.filter(l=>l.data>=semanaIni()).reduce((a,c)=>a+(c.min||0),0);
  const semPerfil=!(S.perfil.diasMusc||[]).length&&!Object.keys(S.perfil.esportes||{}).length; const prox=proximaSessaoId(); const ps=p.sessoes[prox];
  const semU=semanaUsuario(); const dias=DIASEM.map(dd=>{ const s=semU[dd]; const temEsp=(s.esportes||[]).length; return `<div class="dia ${dd===pl.dia?'hoje':''}"><span>${DN[dd]}</span><i class="${s.musc?'m':''} ${temEsp?'e':''}"></i></div>`; }).join("");
  const lt=window.leituraSemana(); const ck=S.checkins[S.checkins.length-1]||{}; const pes=(S.pesagens||[]).slice(-7); const media=pes.length?Math.round(pes.reduce((a,x)=>a+x.peso,0)/pes.length*10)/10:null;
  return `
  ${semPerfil?`<div class="card" style="border-color:var(--ember);margin-top:8px"><b>Complete seu perfil em 2 minutos</b><p class="small">Esportes, dias de musculação e metas. Com isso o DOSE monta a ficha certa e as calorias.</p><button class="btn em sm" onclick="go('onboard',{i:0})">Completar agora</button></div>`:""}
  <div class="hero4"><div class="eyebrow">${DIAS[pl.dia]} · ${fmtDL(today())}</div>
    <div class="arco-wrap">${window.arcoSVG(d.score,230,corDose(d.score))}<div class="arco-num"><div class="big">${d.score}</div><div class="arco-lbl" style="color:${corDose(d.score)}">dose ${d.nivel}</div></div></div>
    ${(()=>{ const f=window.fraseHoje(pl,p,d); return `<p class="serif coach" style="text-align:center;margin:4px 0 2px">${f.t} <i>${f.i}</i></p><div class="tiny" style="text-align:center">${f.sub}</div>`; })()}</div>
  <div class="tiles">
    <div class="tile" onclick="go('progresso',{g:'treino'})"><div class="tl">Semana</div><div class="tv">${pct}<small>%</small></div><div class="ts">${sessSem} musc · ${espSem} esporte · ${cardSem} min</div></div>
    <div class="tile" onclick="go('nutricao',{t:'peso'})"><div class="tl">Peso · 7 dias</div><div class="tv">${media!=null?String(media).replace('.',','):'—'}<small>${media!=null?' kg':''}</small></div><div class="ts">${ck.sono!=null?`sono ${ck.sono} h`:"registre a pesagem"}</div></div>
  </div>
  <div class="card hero" style="margin-top:12px"><div class="row" style="justify-content:space-between;align-items:flex-start;gap:10px"><div><div class="eyebrow">${pl.sessao?"Hoje":pl.dia==="dom"?"Descanso":"Próxima da rotação"}</div><b style="font-size:20px;display:block;margin-top:2px">${esc(ps.nome)}</b><div class="tiny">${ps.slots.length} exercícios · ${ps.slots.reduce((a,s)=>a+s.sets,0)} séries${ps.cardio?` · cardio ${esc(ps.cardio)}`:""}</div></div></div>
    <div class="grid2" style="margin-top:12px"><button class="btn em" onclick="go('sessao',{s:'${prox}'})">${I("play")} Iniciar</button><button class="btn sec" onclick="sheet(V._trocar())">Trocar ou pular</button></div>
    ${pl.nota?`<p class="tiny" style="margin-top:8px">${esc(pl.nota)}</p>`:""}</div>
  <div class="quick"><button onclick="sheet(V._logEsporte())">${I("football",20)}<span>Esporte</span></button><button onclick="sheet(V._logCardio())">${I("heart",20)}<span>Cardio</span></button><button onclick="go('nutricao',{t:'peso'})">${I("scale",20)}<span>Pesar</span></button><button onclick="go('nutricao')">${I("nutrition",20)}<span>Comer</span></button><button onclick="go('progresso',{t:'checkin'})">${I("check",20)}<span>Check-in</span></button></div>
  <div class="semana4">${dias}</div>
  ${window.V_corpo()}
  ${window.V_caminho()}
  ${lt.length?`<h3>Leitura do coach</h3><div class="list">${lt.slice(0,2).map(x=>`<div class="item" style="border-left:3px solid var(--${x.n==='stop'?'stop':x.n==='watch'?'warn':x.n==='ok'?'ok':'bone'})"><div class="t"><b>${esc(x.t)}</b><span>${esc(x.d)}</span></div></div>`).join("")}</div>`:""}
  ${window.adSlot('hoje')}
  <h3>Volume da semana</h3><div class="card">${["Dorsal","Ombro","Peitoral","Quadríceps","Posterior","Glúteo","Tríceps","Bíceps"].map(g=>volBar(g,vol[g]||0)).join("")}</div>`; };
A.hoje=()=>{ const a=document.querySelector('.arco-v'); if(a){ const off=a.getAttribute('stroke-dashoffset'); a.setAttribute('stroke-dashoffset',a.getAttribute('stroke-dasharray')); requestAnimationFrame(()=>requestAnimationFrame(()=>{ a.style.transition='stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)'; a.setAttribute('stroke-dashoffset',off); })); } };
})();

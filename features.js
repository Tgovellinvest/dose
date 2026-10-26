// ================= DOSE · features v1.7 (benchmark backlog) =================
// Mapa de recuperação, dose de hoje, platô, card da semana, notificação/wake lock, check-in pós-sessão.
(function(){
const GRUPOS=["Peitoral","Dorsal","Ombro","Bíceps","Tríceps","Quadríceps","Posterior","Glúteo","Panturrilha","Abdômen","Core","Trapézio"];
const diasDesde=d=>d?Math.floor((Date.now()-new Date(d+"T12:00:00").getTime())/864e5):null;

// --- Mapa de recuperação por grupo (último estímulo + volume da semana vs alvo) ---
window.mapaRecuperacao=function(){
  const ultimo={};
  S.logs.slice().sort((a,b)=>a.data.localeCompare(b.data)).forEach(l=>{ const gs=new Set(); l.sets.filter(s=>s.done).forEach(s=>{ const e=EX[s.ex]; if(!e) return; gs.add(e.grupo); Object.keys(INDIRETAS[e.grupo]||{}).forEach(g2=>gs.add(g2)); }); gs.forEach(g=>ultimo[g]=l.data); });
  const vol=volumeSemana();
  return GRUPOS.map(g=>{ const dd=diasDesde(ultimo[g]); const [lo,hi]=ALVO[g]||[0,0]; const v=Math.round((vol[g]||0)*10)/10;
    // 0–1 dia: em recuperação; 2 dias: pronto; ≥3: fresco (Schoenfeld 2017: 48 h basta para a maioria dos grupos)
    const st=dd==null?"fresco":dd<=1?"recuperando":dd===2?"pronto":"fresco";
    return {g,dias:dd,st,vol:v,lo,hi,falta:Math.max(0,lo-v)}; });
};
window.V_mapa=function(){
  const m=window.mapaRecuperacao();
  const cor={recuperando:"var(--warn)",pronto:"var(--ok)",fresco:"var(--tx2)"};
  return `<div class="card"><div class="row"><b>Mapa de recuperação</b><span class="tiny">48 h = pronto</span></div><div class="grid3" style="margin-top:8px;gap:6px">${m.map(x=>`<div class="kpi" style="border-left:3px solid ${cor[x.st]};text-align:left;padding:6px 8px"><div class="small" style="font-weight:700">${x.g}</div><div class="tiny">${x.dias==null?"sem registro":x.dias===0?"hoje":x.dias+" d atrás"} · ${x.vol}/${x.lo} séries</div></div>`).join("")}</div><p class="tiny" style="margin-top:6px">Laranja: treinado há menos de 48 h. Verde: pronto. Cinza: fresco ou sem registro. Séries contam diretas + 0,5 indiretas vs piso do alvo.</p></div>`;
};

// --- Dose de hoje: um número com contribuintes (Oura/WHOOP, mas sem caixa-preta) ---
// Carga de uma atividade (sRPE = minutos × RPE, Foster 2001). Sem RPE: 7 (moderado-alto) para esporte, 5 para cardio.
window.cargaAtiv=function(x,tipo){ if(tipo==='musc'){ const sets=(x.sets||[]).filter(s=>s.done).length; const min=x.dur||Math.max(20,sets*3); const rpe=x.esforco?({1:5,2:7,3:9})[x.esforco]:7; return Math.round(min*rpe); }
  const min=x.min||(tipo==='esp'?60:30); const rpe=x.rpe||(tipo==='esp'?7:5); return Math.round(min*rpe); };
window.atividadesDe=function(d){ const out=[]; S.logs.filter(l=>l.data===d).forEach(l=>out.push({tipo:'musc',nome:l.nome||"Musculação",min:l.dur||null,rpe:l.esforco?({1:5,2:7,3:9})[l.esforco]:null,carga:cargaAtiv(l,'musc')}));
  S.bjj.filter(b=>b.data===d).forEach(b=>out.push({tipo:'esp',nome:b.tipo||nomeEsp(b.esporte),min:b.min||null,rpe:b.rpe||null,carga:cargaAtiv(b,'esp')}));
  S.cardio.filter(c=>c.data===d).forEach(c=>out.push({tipo:'cardio',nome:c.tipo?String(c.tipo).charAt(0).toUpperCase()+String(c.tipo).slice(1):"Cardio",min:c.min||null,rpe:c.rpe||null,carga:cargaAtiv(c,'cardio')})); return out; };
const nomeEsp=k=>((window.SPORTS||[]).find(x=>x.id===k)||{}).nome||"Esporte";
// --- Dose de hoje: prontidão (sono, fadiga, dor, ontem) menos o que você já gastou hoje ---
window.doseHoje=function(){
  const why=[]; let score=100;
  const ck=S.checkins[S.checkins.length-1];
  if(ck&&ck.sono!=null&&diasDesde(ck.data)<=7){ if(ck.sono<6){score-=25;why.push({t:`Sono ${ck.sono} h`,d:"−25 · abaixo de 6 h (Craven 2022)"});} else if(ck.sono<7){score-=10;why.push({t:`Sono ${ck.sono} h`,d:"−10 · entre 6 e 7 h"});} }
  if(ck&&ck.fadiga!=null&&diasDesde(ck.data)<=7){ if(ck.fadiga>=7){score-=20;why.push({t:`Fadiga ${ck.fadiga}/10`,d:"−20 · check-in"});} else if(ck.fadiga>=5){score-=8;why.push({t:`Fadiga ${ck.fadiga}/10`,d:"−8"});} }
  const sem=S.logs.filter(l=>l.data>=semanaIni()); const dor=Math.max(0,...sem.map(l=>Math.max(l.dorCot||0,l.dorJo||0)),...S.bjj.filter(b=>b.data>=semanaIni()).map(b=>Math.max(b.dorCot||0,b.dorJo||0)));
  if(dor>=6){score-=30;why.push({t:`Dor ${dor}/10`,d:"−30 · não atravessar dor aguda"});} else if(dor>=4){score-=12;why.push({t:`Dor ${dor}/10`,d:"−12"});}
  const ontem=new Date(); ontem.setDate(ontem.getDate()-1); const o=ontem.ymd();
  const atO=atividadesDe(o); const cargaO=atO.reduce((a,x)=>a+x.carga,0);
  if(atO.length>=2){score-=10;why.push({t:"Dois estímulos ontem",d:"−10"});} else if(cargaO>=600){score-=8;why.push({t:"Carga alta ontem",d:`−8 · ${cargaO} (min × RPE)`});}
  const esf=sem.map(l=>l.esforco).filter(x=>x!=null); if(esf.length>=2&&esf.slice(-2).every(x=>x>=3)){score-=10;why.push({t:"Esforço alto nas últimas sessões",d:"−10 · check-in pós-sessão"});}
  const base=Math.max(20,Math.min(100,score));
  // o que já foi feito hoje consome dose: 1 ponto a cada 12 de carga (60 min × RPE 7 ≈ 35), mínimo 5 por atividade
  const feitos=atividadesDe(today()); let consumo=0;
  feitos.forEach(f=>{ const pts=Math.max(5,Math.round(f.carga/12)); consumo+=pts; why.unshift({t:`${f.nome} hoje${f.min?` · ${f.min} min`:""}${f.rpe?` · RPE ${f.rpe}`:""}`,d:`−${pts} · carga da sessão (min × RPE, Foster 2001)${f.rpe?"":"; sem RPE, contei 7"}`}); });
  consumo=Math.min(consumo,80);
  score=Math.max(10,base-consumo);
  const nivel=score>=85?"cheia":score>=65?"normal":score>=45?"reduzida":"leve";
  const fezMusc=feitos.some(f=>f.tipo==='musc');
  let acao={cheia:"Dia de progredir: +1 rep ou +2,5 kg no composto principal. Se houver prova marcada, é hoje.",normal:"Dose planejada. Progride onde a última sessão fechou a faixa.",reduzida:"Mantenha a carga, corte 1 série por exercício. Sem prova hoje.",leve:"Sessão curta ou descanso ativo. Nada de falha, nada de prova."}[nivel];
  if(consumo>0&&!fezMusc) acao={cheia:"Ainda cabe a musculação planejada inteira.",normal:"Ainda cabe a musculação planejada. Sem buscar recorde hoje.",reduzida:"Se for malhar: mantenha a carga e corte 1 série por exercício.",leve:"Se for malhar: só os compostos, 2 séries, longe da falha. Ou deixe para amanhã."}[nivel];
  if(fezMusc) acao="Treino do dia feito. Agora é comida, água e sono.";
  if(!why.length) why.push({t:"Sem sinais de alerta",d:"check-in, dor e carga dentro do esperado"});
  return {score,base,consumo,feitos,nivel,acao,why};
};
window.V_dose=function(){ const d=window.doseHoje(); const cor=d.score>=85?"var(--ok)":d.score>=65?"var(--tx)":d.score>=45?"var(--warn)":"var(--stop)";
  return `<div class="card"><div class="row" style="align-items:center"><div><div class="eyebrow" style="color:var(--tx2)">Dose de hoje</div><div style="font-family:var(--display);font-size:40px;font-weight:900;line-height:1;color:${cor}">${d.score}<span class="small muted" style="font-weight:600"> · ${d.nivel}</span></div></div></div><p class="small" style="margin-top:6px">${esc(d.acao)}</p><div class="tiny" style="margin-top:6px">${d.why.map(w=>`<div>• <b>${esc(w.t)}</b> ${esc(w.d)}</div>`).join("")}</div></div>`; };

// --- Platô por exercício (e1RM Epley por sessão) ---
window.platos=function(){
  const out=[];
  const por={}; S.logs.slice().sort((a,b)=>a.data.localeCompare(b.data)).forEach(l=>{ const best={}; l.sets.filter(s=>s.done&&s.peso&&s.reps).forEach(s=>{ const e1=s.peso*(1+s.reps/30); best[s.ex]=Math.max(best[s.ex]||0,e1); }); Object.entries(best).forEach(([ex,v])=>{ (por[ex]=por[ex]||[]).push({d:l.data,v}); }); });
  Object.entries(por).forEach(([ex,h])=>{ if(!EX[ex]||h.length<4) return; const ult=h.slice(-3), ant=h.slice(0,-3); const maxAnt=Math.max(...ant.map(x=>x.v)); if(ult.every(x=>x.v<=maxAnt*1.005)) out.push({ex,nome:(EX[ex]||{}).nome||ex,sessoes:ult.length,desde:ant[ant.length-1].d,e1:Math.round(maxAnt)}); });
  return out;
};

// --- Check-in pós-sessão (3 toques: pump / dor / esforço — RP) ---
window.V_posSessao=function(){
  const seg=(id,lbl,opts)=>`<div><label>${lbl}</label><div class="seg" id="${id}">${opts.map((o,i)=>`<button type="button" data-v="${i+1}" onclick="segPick(this)">${o}</button>`).join("")}</div></div>`;
  return `<div class="card"><b>Como foi? (3 toques)</b><p class="tiny">Alimenta o ajuste da próxima semana. Sem resposta = não informado.</p>${seg("psPump","Pump/estímulo",["Nada","Ok","Forte"])}${seg("psDor","Dor muscular residual da última vez",["Nenhuma","Alguma","Ainda dolorido"])}${seg("psEsf","Esforço da sessão",["Fácil","Na medida","Muito duro"])}</div>`;
};
window.segPick=function(b){ b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); };
window.lerPosSessao=function(){ const v=id=>{ const el=document.getElementById(id); const on=el&&el.querySelector('button.on'); return on?+on.dataset.v:null; }; return {pump:v("psPump"),dorMusc:v("psDor"),esforco:v("psEsf")}; };

// --- Card da semana (PNG, sem feed) ---
window.cardSemana=async function(){
  const vol=volumeSemana(); const sess=S.logs.filter(l=>l.data>=semanaIni()); const bjj=S.bjj.filter(b=>b.data>=semanaIni()).length; const card=S.cardio.filter(c=>c.data>=semanaIni()).reduce((a,c)=>a+(c.min||0),0);
  const series=Object.values(vol).reduce((a,b)=>a+b,0); const tonel=sess.reduce((a,l)=>a+l.sets.filter(x=>x.done).reduce((b,x)=>b+(x.peso||0)*(x.reps||0),0),0);
  let best=null; sess.forEach(l=>l.sets.filter(s=>s.done&&s.peso&&s.reps).forEach(s=>{ const e1=s.peso*(1+s.reps/30); if(!best||e1>best.e1) best={e1,ex:(EX[s.ex]||{}).nome||s.ex,peso:s.peso,reps:s.reps}; }));
  const c=document.createElement('canvas'); c.width=1080; c.height=1350; const x=c.getContext('2d');
  x.fillStyle="#0F1012"; x.fillRect(0,0,1080,1350);
  x.strokeStyle="#F2F1EC"; x.lineWidth=22; x.lineCap="round"; x.beginPath(); x.moveTo(90,230); x.bezierCurveTo(230,210,300,110,420,90); x.stroke(); x.fillStyle="#E4572E"; x.beginPath(); x.arc(420,90,26,0,7); x.fill();
  x.fillStyle="#F2F1EC"; x.font="900 120px Archivo, Arial"; x.fillText("DOSE", 90, 420); x.fillStyle="#E4572E"; x.fillText(".", 470, 420);
  x.fillStyle="#D8D2C2"; x.font="600 40px Archivo, Arial"; const ini=new Date(semanaIni()+"T12:00:00"); x.fillText(`Semana de ${ini.getDate()}/${ini.getMonth()+1}`, 90, 500);
  const kpi=(y,v,l)=>{ x.fillStyle="#F2F1EC"; x.font="900 150px 'Archivo Narrow', Archivo, Arial"; x.fillText(String(v), 90, y); x.fillStyle="#D8D2C2"; x.font="600 40px Archivo, Arial"; x.fillText(l, 90, y+55); };
  kpi(720, sess.length+bjj, "sessões (" + sess.length + " força · " + bjj + " tatame" + (card?" · "+card+" min cardio":"") + ")");
  kpi(960, Math.round(series), "séries na semana");
  kpi(1200, tonel>=1000?Math.round(tonel/1000)+"t":Math.round(tonel)+"kg", best?`melhor série: ${best.ex} ${best.peso} kg × ${best.reps}`:"tonelagem");
  x.fillStyle="#E4572E"; x.fillRect(90,1290,900,6); x.fillStyle="#D8D2C2"; x.font="500 28px Archivo, Arial"; x.fillText("A dose certa. Registrado, não prometido.", 90, 1335);
  const url=c.toDataURL("image/png"); const a=document.createElement('a'); a.href=url; a.download=`dose-semana-${semanaIni()}.png`; document.body.appendChild(a); a.click(); a.remove(); toast("Card gerado");
};

// --- Notificação no fim do descanso + tela acesa na sessão ---
window.pedirAviso=async function(){ if(!("Notification" in window)) return toast("Sem suporte a notificação"); const p=await Notification.requestPermission(); S.aviso=p==="granted"; save(); toast(S.aviso?"Aviso ligado":"Aviso não autorizado"); };
window.avisaFim=function(){ try{ if(S.aviso&&Notification.permission==="granted"&&document.visibilityState!=="visible") new Notification("DOSE",{body:"Descanso acabou. Próxima série.",silent:false}); }catch(e){} };
let wl=null; window.manterTela=async function(on){ try{ if(on&&"wakeLock" in navigator&&!wl){ wl=await navigator.wakeLock.request("screen"); wl.addEventListener("release",()=>{wl=null;}); } if(!on&&wl){ await wl.release(); wl=null; } }catch(e){} };
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible"&&/^#sessao/.test(location.hash)) window.manterTela(true); });
})();

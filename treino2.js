// ================= DOSE · v6.8 — Hyrox e corrida ampliados, minha playlist =================
// Fontes (todas abertas em 08/11/2026):
// · Ritmo pelo teste: VDOT de Daniels & Gilbert (1979), equações conferidas em getfitcraft.com/tools/vdot-calculator.
//   Faixas: fácil 59–74% · maratona ~80–84% · limiar 88% · intervalado 97–100% do VDOT (Daniels' Running Formula, 4ª ed.).
// · Hyrox: cargas Open/Pro por sexo (Red Bull, "HYROX weights overview"); dupla e revezamento (hyranking.com, divisões);
//   mediana de 700 mil resultados: 1:27:56 homens Open e 1:36:20 mulheres Open (Box Life Magazine, dados Pyrox).
(function(){
const V=window.VIEWS, A=window.AFTER;
const T=(titulo,tipo,intens,alvo,passos,extra)=>Object.assign({titulo,tipo,intens,alvo:alvo||{},passos:passos||[]},extra||{});
const R=window.PLANOS.corrida, H=window.PLANOS.hyrox;
const fmtPace=minkm=>{ if(!minkm||!isFinite(minkm)) return "—"; let m=Math.floor(minkm), s=Math.round((minkm-m)*60); if(s===60){m++;s=0;} return `${m}:${String(s).padStart(2,'0')}`; };

// ---------- Ritmo pelo teste (VDOT) ----------
const vo2=v=>-4.60+0.182258*v+0.000104*v*v; // v em m/min
const fracMax=t=>0.8+0.1894393*Math.exp(-0.012778*t)+0.2989558*Math.exp(-0.1932605*t); // t em min
window.calcVDOT=(km,min)=>{ if(!km||!min||km<1.5||km>42.3||min<4) return null; const v=km*1000/min; const x=vo2(v)/fracMax(min); return x>=20&&x<=85?Math.round(x*10)/10:null; };
const velDe=alvo=>{ const a=0.000104,b=0.182258,c=-4.60-alvo; return (-b+Math.sqrt(b*b-4*a*c))/(2*a); }; // m/min
const paceDe=(vd,pct)=>1000/velDe(vd*pct); // min/km
window.ritmos=vd=>vd?{E:[paceDe(vd,0.74),paceDe(vd,0.66)],M:paceDe(vd,0.82),T:paceDe(vd,0.88),I:paceDe(vd,0.98)}:null;
const vdotAtual=()=>S.vdot&&S.vdot.v?S.vdot:null;
window.atualizaVDOT=(reg,forcar)=>{ if(!reg||!reg.dist||!reg.min) return; const x=calcVDOT(reg.dist,reg.min); if(!x) return; const at=vdotAtual();
  if(forcar||!at||x>at.v||((Date.now()-new Date(at.data+"T12:00:00"))>120*864e5)){ S.vdot={v:x,data:reg.data||today(),km:reg.dist,min:reg.min}; save(); toast(`Seu índice de corrida: ${String(x).replace('.',',')}. Ritmos atualizados.`); } };
const ehTeste=t=>/teste|prova/i.test(t||"");
const zonaPara=s=>{ const z=(s.alvo&&s.alvo.zona)||""; if(/Z5|interval/i.test(z+s.titulo)) return "I"; if(/Z4|limiar/i.test(z)) return "T"; if(/Z3|ritmo de maratona/i.test(z+s.passos.join(" "))) return "M"; if(/Z2|Z1/.test(z)||s.intens==="baixa") return "E"; return null; };
const NOME_R={E:"fácil",M:"ritmo de maratona",T:"limiar",I:"intervalado"};
window.linhaRitmo=k=>{ const vd=vdotAtual(); if(!vd||!k) return null; const r=ritmos(vd.v); return k==="E"?`Seu ritmo fácil: ${fmtPace(r.E[0])} a ${fmtPace(r.E[1])}/km`:`Seu ritmo de ${NOME_R[k]}: ${fmtPace(r[k])}/km`; };
const comRitmo=gen=>(w,st)=>gen(w,st).map(s=>{ if(ehTeste(s.titulo)) return s; const l=linhaRitmo(zonaPara(s)); if(l) s.passos=s.passos.concat([l]); return s; });

// ---------- Corrida: 4 planos novos ----------
const strides="6 acelerações de 20 s no fim (soltas, sem sprint), 1 min andando entre elas";
Object.assign(R,{
 base:{nome:"Base aeróbica",sem:6,dias:3,nivel:"já trota 20–30 min; quer correr mais leve e por mais tempo",refs:"Seiler 2010; Nielsen 2014",
  gen:w=>{ const F=[25,30,35,25,35,40][w-1], L=[40,45,50,35,55,60][w-1];
   return [T("Fácil","facil","baixa",{min:F,zona:"Z2"},[`${F} min em Z2`,"Ritmo de conversa do começo ao fim"]),
    T(w>=2?"Fácil + acelerações":"Fácil","facil","baixa",{min:F,zona:"Z2"},w>=2?[`${F} min em Z2`,strides]:[`${F} min em Z2`]),
    T(w===6?"Teste de 3 km":"Longo",w===6?"qualidade":"longo",w===6?"alta":"baixa",w===6?{km:3}:{min:L,zona:"Z2"},w===6?["10 min fácil + 3 acelerações","3 km no ritmo mais forte que você sustenta","Anote o tempo: ele calcula seus ritmos de treino"]:[`${L} min em Z2`,w===4?"Semana leve":"Constante, sem olhar o relógio"])]; }},
 vel5:{nome:"Velocidade 5 km",sem:6,dias:3,nivel:"já corre 5 km; quer baixar o tempo",refs:"Daniels & Gilbert 1979; Seiler 2010",
  gen:w=>{ const F=[30,35,35,30,40,25][w-1], L=[45,50,55,40,60,30][w-1];
   const Q=[null,"6 × 800 m no ritmo intervalado / 2 min trote","5 × 1 km no ritmo intervalado / 2 min 30 trote","20 min no ritmo de limiar (semana leve)","12 × 400 m no ritmo intervalado / 1 min trote",null][w-1];
   const q=w===1?T("Teste de 3 km","qualidade","alta",{km:3},["10 min fácil + 3 acelerações","3 km no ritmo mais forte que você sustenta","Anote o tempo: ele define os ritmos das próximas semanas"])
    :w===6?T("Teste de 5 km","qualidade","alta",{km:5},["10 min fácil + 3 acelerações","5 km no seu melhor ritmo","Compare com o teste da semana 1"])
    :T("Qualidade","qualidade","alta",{min:F+20,zona:w===4?"Z4":"Z5"},["10–15 min fácil",Q,"10 min fácil"]);
   return [T("Fácil","facil","baixa",{min:F,zona:"Z2"},[`${F} min em Z2`]),q,T(w===6?"Solto":"Longo","longo","baixa",{min:L,zona:"Z2"},w===6?[`${L} min bem leve`]:[`${L} min em Z2`,strides])]; }},
 volta:{nome:"Volta depois de lesão",sem:6,dias:3,nivel:"parou por lesão e já caminha 30 min sem dor",refs:"regra conservadora do DOSE",
  gen:w=>{ const b=["10 × (1 min trote + 1 min caminhada)","8 × (2 min trote + 1 min caminhada)","6 × (3 min trote + 1 min caminhada)","5 × (4 min trote + 1 min caminhada)","3 × (8 min trote + 1 min caminhada)","25 min de trote contínuo"][w-1];
   const regra="Dor até 3 de 10 durante, e que passou na manhã seguinte: segue. Passou disso: volte uma semana";
   return [T("Trote e caminhada","facil","baixa",{min:30},["5 min caminhando",b,"5 min caminhando",regra]),
    T("Força para correr","fisico","media",{min:25},["Panturrilha unilateral no degrau: 3 × 12 cada perna, descida lenta","Agachamento búlgaro: 3 × 8 cada perna","Ponte de glúteo unilateral: 3 × 10","Equilíbrio em uma perna: 3 × 30 s cada, olhos abertos e depois fechados"]),
    T("Trote e caminhada","facil","baixa",{min:30},[b,regra,"Se a lesão teve diagnóstico, siga a liberação de quem te acompanha"])]; }},
 hibrido:{nome:"Corrida + musculação",sem:8,dias:3,nivel:"faz musculação 2–4× e quer correr melhor sem perder força",refs:"Schumann 2022; Seiler 2010",
  gen:w=>{ const F=[30,30,35,25,35,35,40,25][w-1], L=[45,50,55,40,60,65,70,40][w-1];
   const Q=["4 × 4 min no limiar / 2 min trote","5 × 3 min no ritmo intervalado / 2 min trote","20 min no limiar","4 × 3 min intervalado (semana leve)","3 × 8 min no limiar / 2 min","6 × 3 min no ritmo intervalado / 2 min","2 × 12 min no limiar / 3 min",null][w-1];
   return [T("Fácil","facil","baixa",{min:F,zona:"Z2"},[`${F} min em Z2`,"Pode ser no mesmo dia do treino de superior"]),
    w===8?T("Teste de 5 km","qualidade","alta",{km:5},["10 min fácil + 3 acelerações","5 km no seu melhor ritmo"]):T("Qualidade","qualidade","alta",{min:F+20,zona:/limiar/.test(Q)?"Z4":"Z5"},["10 min fácil",Q,"10 min fácil","De preferência em dia sem treino de perna"]),
    T("Longo","longo","baixa",{min:L,zona:"Z2"},[`${L} min em Z2`,w===4?"Semana leve":"Constante"])]; }}
});
// ritmo personalizado em todos os planos de corrida
Object.values(R).forEach(d=>{ if(!d._r){ d.gen=comRitmo(d.gen); d._r=1; } });

// ---------- Hyrox: cargas por categoria ----------
const HX={open:{m:{push:152,pull:103,farmer:"2 × 24 kg",lunge:20,wb:6},f:{push:102,pull:78,farmer:"2 × 16 kg",lunge:10,wb:4}},
          pro:{m:{push:202,pull:153,farmer:"2 × 32 kg",lunge:30,wb:9},f:{push:152,pull:103,farmer:"2 × 24 kg",lunge:20,wb:6}}};
window.hyCargas=()=>{ const d=(S.hyroxDiv==="pro")?"pro":"open"; const sx=(S.perfil&&S.perfil.sexo==="f")?"f":"m"; return Object.assign({div:d,sx},HX[d][sx]); };
const kg5=x=>Math.round(x/5)*5;
const cg=(pct)=>{ const c=hyCargas(); const p=pct/100; const r=x=>pct>=100?x:kg5(x*p); return {push:`${r(c.push)} kg com o trenó`,pull:`${r(c.pull)} kg com o trenó`,farmer:pct>=90?c.farmer:"halteres ou kettlebells um pouco mais leves que a prova",lunge:`${pct>=100?c.lunge:Math.max(5,kg5(c.lunge*p))} kg`,wb:`${c.wb} kg`}; };
const SUB="Sem sled na academia: empurre a esteira desligada (sled push) e puxe uma anilha com corda (sled pull). Sem SkiErg: remo ou puxada com elástico em pé";
const est=(pct)=>{ const c=cg(pct); return {ski:"SkiErg",push:`Sled push (${c.push})`,pull:`Sled pull (${c.pull})`,bbj:"Burpee broad jump",row:"Remo",farmer:`Farmer carry (${c.farmer})`,lunge:`Sandbag lunges (${c.lunge})`,wb:`Wall ball (${c.wb})`}; };
const SIM8=(pct)=>{ const e=est(pct); return [`1 km + ${e.ski} 1.000 m`,`1 km + ${e.push} 50 m`,`1 km + ${e.pull} 50 m`,`1 km + ${e.bbj} 80 m`,`1 km + ${e.row} 1.000 m`,`1 km + ${e.farmer} 200 m`,`1 km + ${e.lunge} 100 m`,`1 km + ${e.wb} 100 reps`]; };

Object.assign(H,{
 primeiro:{nome:"Primeiro Hyrox",sem:12,dias:3,nivel:"corre 3 km e quer fazer a primeira prova",refs:"Brandt 2025; regulamento HYROX",
  gen:w=>{ const pct=[60,60,70,60,70,80,80,70,90,90,80,100][w-1], km=[2,3,3,2,4,4,5,3,5,6,3,0][w-1], rd=[2,2,3,2,3,4,4,2,5,5,3,0][w-1]; const e=est(pct); const leve=[4,8].includes(w);
   if(w===12) return [T("Solto","corrida","baixa",{min:25,zona:"Z2"},["20 min bem leve + 4 acelerações","Separe roupa, tênis e luvas"]),T("Ativação","estacoes","baixa",{min:20},["2 rodadas leves: 250 m de remo, 10 wall balls, 20 m de lunges","Nada pesado: é só lembrar o movimento"]),T("Prova","prova","alta",{min:100},["Hyrox: 8 × (1 km + estação)","Comece o primeiro km mais lento que o planejado","Anote o tempo final"])];
   return [w<=4?T("Corrida fácil","corrida","baixa",{min:[25,30,30,25][w-1],zona:"Z2"},[`${[25,30,30,25][w-1]} min em Z2`,"Ritmo de conversa"])
     :T("Corrida intervalada","corrida","alta",{km,zona:"Z4"},["10 min fácil",`${km} × 1 km no ritmo que você quer na prova / 90 s caminhando`,"10 min fácil"]),
    T("Força + técnica das estações","estacoes",leve?"baixa":"media",{min:50},["Agachamento goblet 3 × 10 · Remada com halter 3 × 10 · Desenvolvimento 3 × 8",`${e.push}: 4 × 12,5 m`,`${e.pull}: 4 × 12,5 m`,`${e.wb}: 3 × 15`,"Burpee broad jump: 3 × 8, sem pressa, técnica primeiro",SUB]),
    w===6?T("Meio simulado","compromised","alta",{min:45},SIM8(pct).slice(0,4).concat(["Anote o tempo total"]))
     :w===10?T("Simulado","compromised","alta",{min:90},SIM8(pct).concat(["Cargas a 90% da prova","Anote o tempo total e o de cada km"]))
     :T("Corrida comprometida","compromised",leve?"media":"alta",{min:15+rd*10},[`${rd} rodadas: 1 km + 1 estação curta (alterne ${e.row} 250 m, ${e.wb} 20 reps, ${e.lunge} 20 m)`,"O objetivo é o km depois da estação sair parecido com o km descansado",leve?"Semana leve: menos rodadas":"Descanso de 2 min entre rodadas"])]; }},
 perf:{nome:"Hyrox performance",sem:12,dias:5,nivel:"já fez Hyrox e quer baixar o tempo",refs:"Brandt 2025; Seiler 2010; Rønnestad & Mujika 2014",
  gen:w=>{ const leve=[4,8].includes(w), tap=w===11; const pct=[90,90,100,80,100,100,100,80,100,100,90,100][w-1]; const e=est(pct); const k=[5,6,6,4,7,7,8,5,8,8,4,0][w-1];
   if(w===12) return [T("Solto","corrida","baixa",{min:25,zona:"Z2"},["20 min leve + 4 acelerações"]),T("Ativação","estacoes","baixa",{min:20},["1 rodada leve das 8 estações, 25% do volume"]),T("Prova","prova","alta",{min:85},["Hyrox: 8 × (1 km + estação)","Primeiro km controlado; acelere do 5º km em diante se estiver bem","Anote o tempo final"])];
   const s=[T("Intervalado de prova","corrida",leve?"media":"alta",{km:k,zona:"Z4"},["15 min fácil",`${k} × 1 km 5–10 s/km mais rápido que o ritmo de prova / 75 s andando`,"10 min fácil"]),
    T("Limiar","corrida","media",{min:[30,35,35,25,40,40,45,30,45,45,25,0][w-1]+20,zona:"Z3–Z4"},["10 min fácil",`${[20,25,25,15,30,30,35,20,35,35,15,0][w-1]} min no limiar`,"10 min fácil"]),
    T("Estações pesadas","estacoes",leve?"baixa":"alta",{min:60},[`${e.push}: 5 × 12,5 m`,`${e.pull}: 5 × 12,5 m`,`${e.wb}: 5 × 20, descanso 60 s`,`${e.lunge}: 4 × 25 m`,`${e.farmer}: 4 × 50 m`,"Burpee broad jump: 4 × 20 m",SUB]),
    w===6||w===10?T("Simulado","compromised","alta",{min:85},SIM8(100).concat(["Cargas de prova","Anote o tempo total e o de cada km"]))
     :T("Comprometida longa","compromised",leve||tap?"media":"alta",{min:60},[`${leve||tap?3:5} rodadas: 1 km + ${["SkiErg 500 m","Remo 500 m","Wall ball 30","Lunges 50 m","Burpee broad jump 40 m"].slice(0,leve||tap?3:5).join(" · ")}`,"Anote cada km: a meta é a diferença entre o km fresco e o km pós-estação cair"]),
    T("Longo","longo","baixa",{min:[60,65,70,50,75,75,80,55,80,80,45,0][w-1],zona:"Z2"},["Corrida contínua em Z2","Treine a hidratação que vai usar na prova"])];
   if(tap) s.forEach(x=>x.passos.unshift("Semana de polimento: metade do volume, mesma intensidade")); if(leve) s.forEach(x=>x.passos.unshift("Semana leve: menos volume, longe do limite")); return s; }},
 dupla:{nome:"Hyrox em dupla ou revezamento",sem:8,dias:3,nivel:"vai correr em dupla (os dois correm os 8 km) ou revezamento (cada um faz 2 blocos)",refs:"regulamento HYROX (divisões)",
  gen:w=>{ const pct=[70,70,80,60,90,90,100,100][w-1]; const e=est(pct); const km=[4,5,5,3,6,6,4,0][w-1];
   if(w===8) return [T("Solto","corrida","baixa",{min:20,zona:"Z2"},["20 min leve, de preferência com a dupla"]),T("Combinar a divisão","estacoes","baixa",{min:15},["Definam quem faz cada estação (ou como dividem as reps)","Na dupla, só um trabalha por vez e os dois correm juntos, a até 15 s um do outro"]),T("Prova","prova","alta",{min:80},["Hyrox em dupla ou revezamento","Anote o tempo final"])];
   return [T("Corrida em ritmo de prova","corrida","alta",{km,zona:"Z4"},["10 min fácil",`${km} × 1 km juntos no ritmo da prova / 90 s`,"Na dupla, o ritmo é o do mais lento: treinem isso","No revezamento, treine 2 × (1 km forte + estação)"]),
    T("Estações em revezamento","estacoes",w===4?"baixa":"alta",{min:45},["EMOM 20 min, alternando: um trabalha, o outro descansa",`Minuto 1: ${e.wb} 15 · Minuto 2: ${e.lunge} 20 m · Minuto 3: Remo 250 m · Minuto 4: Burpee broad jump 10 m`,`${e.push} e ${e.pull}: 4 × 12,5 m cada um`,SUB]),
    w===4?T("Meio simulado em dupla","compromised","alta",{min:40},SIM8(pct).slice(0,4).concat(["Dividam as estações como vão fazer na prova"]))
     :w===7?T("Simulado em dupla","compromised","alta",{min:80},SIM8(pct).concat(["Cargas de prova","Anote o tempo e onde a troca demorou"]))
     :T("Corrida comprometida","compromised","media",{min:40},[`${[3,3,4,0,4,5][w-1]||3} rodadas: 1 km juntos + 1 estação dividida`,"Treine a troca: falar pouco, combinar antes"])]; }}
});

// ---------- Sessões avulsas (biblioteca) ----------
const AV={
 corrida:[
  ["teste3","Teste de 3 km","alta",{km:3},["10 min fácil + 3 acelerações","3 km no ritmo mais forte que você sustenta","Calibra seus ritmos de treino"]],
  ["fartlek","Fartlek 30 min","media",{min:40,zona:"Z3"},["10 min fácil","10 × (1 min forte + 1 min leve)","10 min fácil"]],
  ["subidas","Subidas","alta",{min:40,zona:"Z5"},["15 min fácil até a subida","8 × 60 s subindo forte, volta trotando","10 min fácil"]],
  ["progressivo","Progressivo 40 min","media",{min:40,zona:"Z2–Z4"},["Cada 10 min um pouco mais rápido","Termina no ritmo de limiar"]],
  ["tempo","Ritmo de limiar (tempo run)","alta",{min:45,zona:"Z4"},["10 min fácil","20 min no limiar","10 min fácil"]],
  ["strides","Fácil + acelerações","baixa",{min:35,zona:"Z2"},["30 min em Z2",strides]],
  ["i800","6 × 800 m","alta",{min:50,zona:"Z5"},["15 min fácil","6 × 800 m no ritmo intervalado / 2 min trote","10 min fácil"]],
  ["i1000","5 × 1 km","alta",{min:50,zona:"Z5"},["15 min fácil","5 × 1 km no ritmo intervalado / 2 min 30 trote","10 min fácil"]],
  ["i400","12 × 400 m","alta",{min:45,zona:"Z5"},["15 min fácil","12 × 400 m no ritmo intervalado / 1 min trote","10 min fácil"]],
  ["longofinal","Longo com final rápido","media",{min:70,zona:"Z2"},["60 min em Z2","Últimos 10 min no ritmo de maratona"]]
 ],
 hyrox:[
  ["remo1k","Remo + 1 km","alta",{min:40},["10 min fácil","4 × (remo 1.000 m + 1 km de corrida sem pausa) / 3 min","Anote o km depois do remo"]],
  ["meioA","Meio simulado (estações 1 a 4)","alta",{min:45},()=>SIM8(80).slice(0,4)],
  ["meioB","Meio simulado (estações 5 a 8)","alta",{min:45},()=>SIM8(80).slice(4)],
  ["circuito","Circuito de estações","media",{min:40},()=>{ const e=est(80); return [`3 rodadas, 2 min de descanso: ${e.farmer} 200 m · ${e.lunge} 20 m · ${e.wb} 20 · Burpee broad jump 20 m`]; }],
  ["emomwb","EMOM de wall ball","alta",{min:20},()=>[`EMOM 10 min: ${est(100).wb} × 15 por minuto`,"Se não fechar 15 com folga, faça 12","Mira a marca: cada bola que não bate é repetição perdida"]],
  ["bbj","Técnica de burpee broad jump","media",{min:25},["5 × 10 m devagar: peito no chão, pés juntos, salto curto e regular","3 × 20 m no ritmo de prova","Respiração no ritmo do salto"]],
  ["sled","Sled pesado","alta",{min:35},()=>{ const e=est(100); return [`${e.push}: 6 × 12,5 m / 90 s`,`${e.pull}: 6 × 12,5 m / 90 s`,SUB]; }],
  ["simulado","Simulado completo","alta",{min:90},()=>SIM8(100).concat(["Anote o tempo total e o de cada km"])]
 ]};
const avDe=(esp,k)=>{ const a=(AV[esp]||[]).find(x=>x[0]===k); if(!a) return null; const passos=typeof a[4]==="function"?a[4]():a[4].slice(); const s=T(a[1],"avulsa",a[2],a[3],passos); if(esp==="corrida"&&!ehTeste(s.titulo)){ const l=linhaRitmo(zonaPara(s)); if(l) s.passos.push(l); } return s; };
window.cardAvulsas=esp=>{ const L=AV[esp]; if(!L) return ""; return `<details class="card"><summary><b>Sessões avulsas</b> <span class="tiny">· ${L.length} treinos para escolher hoje</span></summary><div class="list" style="margin-top:8px">${L.map(a=>`<div class="item" onclick="sheet(V._logAvulsa('${esp}','${a[0]}'))"><div class="t"><b>${esc(a[1])}</b><span>${esc((typeof a[4]==="function"?a[4]():a[4]).slice(0,2).join(" · "))}</span></div><span class="arrow">›</span></div>`).join("")}</div>${esp==='corrida'?`<p class="tiny">${vdotAtual()?`Índice de corrida ${String(S.vdot.v).replace('.',',')} (${fmtD(S.vdot.data)}). Ritmos: ${linhaRitmo("E").replace("Seu ritmo fácil: ","fácil ")} · limiar ${fmtPace(ritmos(S.vdot.v).T)} · intervalado ${fmtPace(ritmos(S.vdot.v).I)}/km.`:"Faça o teste de 3 km para o app calcular seus ritmos (método VDOT, Daniels & Gilbert)."}</p>`:""}</details>`; };
V._logAvulsa=(esp,k)=>{ const s=avDe(esp,k); if(!s) return ""; const a=s.alvo||{}; const run=esp==='corrida';
  const campos=run?`<div class="grid2"><div><label>Distância (km)</label><input id="avKm" type="number" step="0.01" inputmode="decimal" value="${a.km||''}"></div><div><label>Tempo (min)</label><input id="avMin" type="number" step="0.1" inputmode="decimal" value="${a.km?'':(a.min||'')}"></div></div><label>FC média (opcional)</label><input id="avFc" type="number" inputmode="numeric">`
   :`<div class="grid2"><div><label>Tempo total (min)</label><input id="avMin" type="number" step="0.5" inputmode="decimal" value="${a.min||''}"></div><div><label>Corrida (km)</label><input id="avKm" type="number" step="0.1" inputmode="decimal"></div></div>${/simulado/i.test(s.titulo)?`<label>Tempo do simulado (h:mm:ss ou min)</label><input id="avRes" placeholder="1:24:30">`:""}`;
  return `<h2>${esc(s.titulo)}</h2><p class="tiny">Sessão avulsa · ${esc(((window.SPORTS||[]).find(x=>x.id===esp)||{}).nome||esp)}</p><ul class="small">${s.passos.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
   ${playlistBtn()}
   <label>Data</label><input id="avData" type="date" value="${today()}">${campos}${window.intensHTML?intensHTML('av',esp,({baixa:4,media:6,alta:8})[s.intens]):''}
   <label>Dor depois — toque para marcar</label><div id="avDores">${V._doresInputs?V._doresInputs('av'):''}</div><label>Notas</label><input id="avNotas">
   <button class="btn em" style="margin-top:10px" onclick="salvaAvulsa('${esp}','${k}')">Salvar sessão</button>`; };
const segs=v=>{ if(!v) return null; v=String(v).trim(); if(/^\d+(\.\d+)?$/.test(v)) return parseFloat(v)*60; const p=v.split(':').map(Number); if(p.some(isNaN)) return null; return p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1]; };
window.salvaAvulsa=(esp,k)=>{ const s=avDe(esp,k); const g=id=>document.getElementById(id); const val=id=>g(id)?g(id).value:""; const it=window.intLer?intLer('av'):{rpe:6,k:'media'}; const dores=window.lerDores?lerDores('av'):{};
  const base={id:uid(),data:val('avData')||today(),min:num(val('avMin'))||null,rpe:it.rpe,intens:it.k,dores,notas:val('avNotas'),avulsa:k,titulo:s?s.titulo:k};
  if(esp==='corrida'){ const reg=Object.assign(base,{tipo:"Corrida",dist:num(val('avKm'))||null,fc:num(val('avFc'))||null}); if(!reg.min) return toast("Coloque o tempo"); S.cardio.push(reg); S.cardio.sort((a,b)=>a.data.localeCompare(b.data)); atualizaVDOT(reg,k==="teste3"); }
  else { const reg=Object.assign(base,{esporte:esp,tipo:((window.SPORTS||[]).find(x=>x.id===esp)||{}).nome||esp,dist:num(val('avKm'))||undefined}); if(val('avRes')) reg.tempoProva=segs(val('avRes')); S.bjj.push(reg); S.bjj.sort((a,b)=>a.data.localeCompare(b.data)); }
  save(); closeSheet(); toast("Sessão registrada"); route(); };
// testes e provas dos planos de corrida também calibram o ritmo
const _sp=window.salvaPlano; window.salvaPlano=(esp,w,sid)=>{ const n=S.cardio.length; _sp(esp,w,sid); if(esp==='corrida'&&S.cardio.length>n){ const reg=S.cardio.find(c=>c.plano&&c.plano.esp===esp&&c.plano.w===w&&c.plano.sid===sid&&c.data); const st=planoAtivo(esp); const d=st&&window.PLANOS.corrida[st.id]; const s=d?d.gen(w,st).find((x,i)=>"s"+(i+1)===sid):null; if(reg) atualizaVDOT(reg,s&&ehTeste(s.titulo)); } };

// ---------- Hyrox: escolher categoria ----------
window.cardHyroxDiv=()=>{ const c=hyCargas(); return `<div class="card sub"><div class="row" style="justify-content:space-between;align-items:center;gap:10px"><b>Sua categoria</b><div class="chips">${[["open","Open"],["pro","Pro"]].map(([k,n])=>`<button class="chip ${c.div===k?'on':''}" onclick="S.hyroxDiv='${k}';save();route()">${n}</button>`).join("")}</div></div><p class="tiny" style="margin-top:6px">Cargas de prova (${c.sx==='f'?'feminino':'masculino'} ${c.div==='pro'?'Pro':'Open'}): sled push ${c.push} kg e sled pull ${c.pull} kg com o trenó · farmer ${c.farmer} · lunges ${c.lunge} kg · wall ball ${c.wb} kg. Mediana de 700 mil resultados: 1:27:56 (homens Open) e 1:36:20 (mulheres Open). Treinos usam % dessas cargas.</p></div>`; };

// ---------- Minha playlist ----------
const PL_OK=/^https:\/\/(open\.spotify\.com|spotify\.link|music\.youtube\.com|(www\.|m\.)?youtube\.com|youtu\.be|music\.apple\.com|deezer\.page\.link|www\.deezer\.com)\//i;
const plNome=u=>/spotify/i.test(u)?"Spotify":/music\.youtube/i.test(u)?"YouTube Music":/youtu/i.test(u)?"YouTube":/apple/i.test(u)?"Apple Music":/deezer/i.test(u)?"Deezer":"música";
window.playlistBtn=()=>{ const u=S.perfil&&S.perfil.playlist; if(!u||!PL_OK.test(u)) return ""; return `<a class="btn sm sec" style="margin:4px 0 10px;width:auto;display:inline-flex;gap:6px;align-items:center" href="${esc(u)}" target="_blank" rel="noopener">▶ Tocar minha playlist <span class="tiny">· ${plNome(u)}</span></a>`; };
const _mp=V.meuperfil; V.meuperfil=(p)=>_mp(p).replace(/(<p class="tiny">Só aparece para alguém quando os dois marcam "treinaria de novo"\.<\/p><\/div>)/,`$1
  <div class="card"><b>Minha playlist de treino</b><p class="tiny">Cole o link de uma playlist do Spotify, YouTube Music, YouTube, Apple Music ou Deezer. O botão "Tocar" aparece no começo de cada treino e abre direto no app de música.</p>
   <input id="mpPl" inputmode="url" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="300" value="${esc((S.perfil&&S.perfil.playlist)||'')}" placeholder="https://open.spotify.com/playlist/..."></div>`);
const _mps=window.mpSalvar; window.mpSalvar=()=>{ const el=document.getElementById('mpPl'); if(el){ const v=el.value.trim(); if(v&&!PL_OK.test(v)) return toast("Link de playlist: use o link do Spotify, YouTube Music, YouTube, Apple Music ou Deezer"); S.perfil.playlist=v||null; } return _mps(); };

// ---------- Onde aparece ----------
// Musculação e planos de esporte: botão da playlist
const _ses=V.sessao; V.sessao=(p)=>{ const h=_ses(p); return h.replace('<details><summary>Aquecimento (6–10 min)</summary>',playlistBtn()+'<details><summary>Aquecimento (6–10 min)</summary>'); };
const _lp=V._logPlano; V._logPlano=(esp,w,sid)=>_lp(esp,w,sid).replace('<label>Data</label>',playlistBtn()+'<label>Data</label>');
// Página do esporte: categoria do Hyrox e sessões avulsas
const _e=V._esporte; V._esporte=(p)=>{ let h=_e(p); const extra=(p.id==='hyrox'?cardHyroxDiv():"")+cardAvulsas(p.id); if(!extra) return h; const ev=window.cardEvolucao?cardEvolucao(p.id):""; return ev&&h.includes(ev)?h.replace(ev,ev+extra):h.replace('</h1>','</h1>'+extra); };

// ---------- Ciência ----------
(window.SCIENCE||[]).push(
 {t:"Ritmo de treino a partir de um teste (VDOT)",cat:"Esportes",oque:"O tempo de uma prova ou teste estima o índice de condicionamento de corrida (VDOT); dele saem os ritmos de cada tipo de treino.",regra:"Teste de 3 ou 5 km → ritmos fácil (59–74% do VDOT), maratona (~82%), limiar (88%) e intervalado (98%) aparecem em cada sessão de corrida.",ref:"Daniels & Gilbert, Oxygen Power (1979); Daniels' Running Formula, 4ª ed. (2022)",url:"https://getfitcraft.com/tools/vdot-calculator",status:"verificado"},
 {t:"Hyrox: cargas e formato oficiais",cat:"Esportes",oque:"8 × (1 km + estação). Open: sled push 152/102 kg e sled pull 103/78 kg com o trenó, farmer 2 × 24/2 × 16 kg, lunges 20/10 kg, wall ball 6/4 kg (masc./fem.). Pro sobe cada carga um degrau.",regra:"Os treinos de estação mostram a carga da sua categoria e do seu sexo, em % da carga de prova.",ref:"Red Bull, HYROX weights overview; hyranking.com (divisões)",url:"https://www.redbull.com/gb-en/hyrox-weights-overview",status:"verificado"}
);
})();

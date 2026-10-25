// Coach DOSE — leitura automática da semana, autorregulação, aquecimento, feeder sets, alertas
// Fontes: ACSM 2026; Pelland 2026; Robinson 2024; Singer 2024; Helms 2014; Schumann 2022; OMS 2020; regras do Projeto (08 - Progressão e Check-in)
(function(){
const semIni=(off=0)=>{ const x=new Date(); x.setDate(x.getDate()-((x.getDay()+6)%7)-7*off); return x.toISOString().slice(0,10); };
const semFim=(off=0)=>{ const x=new Date(semIni(off)+"T12:00:00"); x.setDate(x.getDate()+7); return x.toISOString().slice(0,10); };
function inSem(d,off){ return d>=semIni(off)&&d<semFim(off); }

// ---------- Leitura da semana (o que o check-in do projeto pede) ----------
window.leituraSemana=function(){
  const out=[]; const vol=volumeSemana(); const logs0=S.logs.filter(l=>inSem(l.data,0)), logs1=S.logs.filter(l=>inSem(l.data,1));
  const bjj0=S.bjj.filter(b=>inSem(b.data,0)); const card0=S.cardio.filter(c=>inSem(c.data,0)); const minZ2=card0.filter(c=>/z2|caminh|base/i.test(c.tipo)).reduce((a,c)=>a+(c.min||0),0);
  const cks=S.checkins.slice(-2); const last=cks[cks.length-1], prev=cks[cks.length-2];
  // 1. dor
  const dores=[...logs0,...bjj0].map(x=>Math.max(x.dorCot||0,x.dorJo||0)); const dorMax=dores.length?Math.max(...dores):0; const doresPrev=[...logs1,...S.bjj.filter(b=>inSem(b.data,1))].map(x=>Math.max(x.dorCot||0,x.dorJo||0)); const dorPrev=doresPrev.length?Math.max(...doresPrev):0;
  if(dorMax>=6) out.push({n:"stop",t:"Dor articular alta",d:`Pico de ${dorMax}/10 esta semana. Regra do projeto: não atravessar dor aguda. Tire os exercícios com flag, use isometria submáxima e, se repetir, marque ortopedista do esporte ou fisioterapeuta.`});
  else if(dorMax>=4&&dorMax>dorPrev) out.push({n:"watch",t:"Dor subindo",d:`De ${dorPrev} para ${dorMax}/10. Corte acessórios do membro afetado antes dos compostos e observe a próxima sessão.`});
  // 2. performance (sessões seguidas com queda)
  const quedas=[]; Object.keys(S.pesos).forEach(ex=>{ const hist=S.logs.flatMap(l=>l.sets.filter(s=>s.ex===ex&&s.done&&s.peso).map(s=>({d:l.data,v:s.peso*(1+(s.reps||0)/30)}))); const by={}; hist.forEach(h=>{by[h.d]=Math.max(by[h.d]||0,h.v);}); const ks=Object.keys(by).sort(); if(ks.length>=3){ const a=by[ks[ks.length-3]],b=by[ks[ks.length-2]],c=by[ks[ks.length-1]]; if(b<a*0.97&&c<b*0.97) quedas.push(EX[ex]?.nome||ex); } });
  if(quedas.length) out.push({n:"watch",t:"Queda de performance em 2 sessões",d:`${quedas.slice(0,3).join(", ")}. Gatilho de deload do projeto: volume −40–50%, carga −10–15%, RIR 3–4 por uma semana.`});
  // 3. volume x alvo
  const baixo=Object.entries(ALVO).filter(([g,[a]])=>["Dorsal","Ombro","Peitoral","Quadríceps","Posterior","Glúteo"].includes(g)&&(vol[g]||0)<a*0.6&&logs0.length>=2).map(([g])=>g);
  const alto=Object.entries(ALVO).filter(([g,[,b]])=>(vol[g]||0)>b*1.3).map(([g])=>g);
  if(logs0.length>=2&&baixo.length) out.push({n:"info",t:"Abaixo do alvo",d:`${baixo.join(", ")} com menos de 60% do piso. Se a semana acabou, tudo bem; se não, o próximo treino cobre.`});
  if(alto.length) out.push({n:"watch",t:"Acima do alvo",d:`${alto.join(", ")} passou 30% do teto. Mais volume dá retorno decrescente (Pelland 2026) e cobra fadiga. Tira uma série.`});
  // 4. carga de esporte
  if(bjj0.length>=5) out.push({n:"watch",t:`${bjj0.length} treinos de esporte`,d:"Semana pesada: aceite menos volume de musculação, proteja os compostos, corte acessórios. Sono vira prioridade."});
  // 5. cardio
  if(minZ2<60&&logs0.length) out.push({n:"info",t:"Pouco Z2",d:`${minZ2} min de Z2 na semana. OMS: 150–300 min moderados por semana. Cardio não compromete hipertrofia (Schumann 2022); separe ≥3 h da musculação quando der.`});
  // 6. peso / cintura
  if(last&&prev&&last.peso&&prev.peso){ const d=last.peso-prev.peso, pct=d/prev.peso*100; if(pct<-1.2) out.push({n:"watch",t:"Perdendo rápido",d:`${Math.round(pct*10)/10}% na semana. Acima de 1% aumenta a perda de massa magra (Helms 2014). Se foi água, ok; se repetir, suba 100–150 kcal.`}); if(pct>0.5&&(S.perfil.objetivo||"").startsWith("cut")) out.push({n:"info",t:"Peso subiu",d:"Uma semana não é tendência. Confira sal, sono e intestino antes de cortar comida. Duas semanas travadas com aderência confirmada → revisar ingestão ou gasto."}); }
  if(last&&prev&&last.cintura&&prev.cintura&&last.cintura<prev.cintura&&last.peso>=prev.peso) out.push({n:"ok",t:"Cintura caiu com peso estável",d:"Sinal de recomposição: gordura saindo, músculo ficando. Mantém a dose."});
  // 7. sono
  if(last&&last.sono&&last.sono<6.5) out.push({n:"watch",t:"Sono curto",d:`${last.sono} h. Perda aguda de sono custa ~7,6% de desempenho (Craven 2022); força máxima resiste melhor que técnica e endurance. Regra: mantenha a carga, corte volume e não marque prova nesse dia.`});
  // 9. salto de carga semanal (Gabbett 2016; só aviso — Impellizzeri 2020)
  const tonel=k=>S.logs.filter(l=>inSem(l.data,k)).reduce((a,l)=>a+l.sets.filter(x=>x.done).reduce((b,x)=>b+(x.peso||0)*(x.reps||0),0),0);
  const t0=tonel(0), tPrev=[1,2,3,4].map(tonel).filter(x=>x>0); const tMed=tPrev.length>=2?tPrev.reduce((a,b)=>a+b,0)/tPrev.length:0;
  if(tMed>0&&t0>tMed*1.5&&new Date().getDay()>=3) out.push({n:"watch",t:"Semana subiu rápido",d:`Tonelagem ${Math.round(t0/tMed*100)}% da média das últimas ${tPrev.length} semanas. Picos acima de ~1,5× elevam risco de lesão (Gabbett 2016). Não é diagnóstico, é sinal: segure o aumento em 10–15% por semana.`});
  // 10. deload por calendário (Bell 2023, consenso Delphi)
  const semComTreino=[0,1,2,3,4,5,6,7].filter(k=>S.logs.some(l=>inSem(l.data,k))).length; const ultimoDeload=S.checkins.slice(-8).some(c=>c.deload);
  if(semComTreino>=6&&!ultimoDeload&&!quedas.length) out.push({n:"info",t:"Seis ou mais semanas sem deload",d:"Consenso de especialistas: uma semana leve a cada 4–8 semanas, ~50% das séries, carga mantida ou −10–20% (Bell 2023). Marque 'deload' no check-in para registrar."});
  // 11. platô por exercício (Ladder/RP: rep em vez de peso, variar)
  const pl=window.platos?window.platos():[]; if(pl.length) out.push({n:"watch",t:`Platô em ${pl.length===1?pl[0].nome:pl.length+" exercícios"}`,d:`${pl.slice(0,3).map(x=>`${x.nome} parado em ~${x.e1} kg (e1RM) há ${x.sessoes} sessões`).join("; ")}. Regra: adicione 1 rep por série antes de subir carga; se travar de novo, troque a variação do mesmo padrão por 4 semanas (Grgic 2017: o estímulo novo organiza, não multiplica).`});
  // 8. constância
  if(!logs0.length&&!bjj0.length&&!card0.length&&new Date().getDay()>=4) out.push({n:"info",t:"Semana em branco",d:"Ainda dá tempo. Uma sessão curta vale mais que uma semana perfeita que não aconteceu."});
  if(!out.length) out.push({n:"ok",t:"Dentro da dose",d:"Nada para ajustar. Progride uma rep ou uma carga e repete."});
  return out;
};

// ---------- Aquecimento e feeder sets ----------
window.aquecimento=function(sessaoKey){
  const geral=["5–8 min de caminhada, bike ou remo em Z1","2 min de mobilidade do que o dia pede"];
  const esp={push:["Rotação externa de ombro com elástico 2×15","Flexão de braço 1×10 lenta"],pull:["Pull-apart com elástico 2×15","Remada leve 1×12"],legs:["Agachamento corporal 1×12","Ponte de glúteo 1×12","Panturrilha no degrau 1×15"],upperA:["Rotação externa 2×15","Pull-apart 2×15"],upperB:["Rotação externa 2×15","Pull-apart 2×15"],lowerA:["Agachamento corporal 1×12","Ponte de glúteo 1×12"],lowerB:["Agachamento corporal 1×12","Ponte de glúteo 1×12"]};
  return geral.concat(esp[sessaoKey]||esp[/push/i.test(sessaoKey)?'push':/pull/i.test(sessaoKey)?'pull':/leg|lower/i.test(sessaoKey)?'legs':'upperA']||[]);
};
window.feeders=function(pesoTrabalho){ if(!pesoTrabalho) return null; const r=x=>Math.round(x/2.5)*2.5; return [{p:r(pesoTrabalho*0.4),reps:6},{p:r(pesoTrabalho*0.6),reps:4},{p:r(pesoTrabalho*0.8),reps:2}]; };

// ---------- Evidência por padrão/grupo ----------
const EVID={"Peitoral":"Peitoral: presses em ângulos diferentes mudam a ênfase clavicular/esternocostal; crossover completa a adução no fim da amplitude. Volume-alvo 9–11 séries/sem.",
 "Ombro":"Deltoide lateral e posterior respondem a abdução e abdução horizontal com tensão contínua (polia). Deltoide anterior já recebe volume indireto dos presses (0,5 por série, Pelland 2026).",
 "Tríceps":"Cabeça longa cruza o ombro: trabalha alongada com o braço acima da cabeça (overhead) e encurtada no pressdown. Treinar o músculo alongado tende a dar mais hipertrofia (Pedrosa 2022, Maeo 2023).",
 "Dorsal":"Latíssimo: adução + extensão de ombro. Puxada vertical (largura), remada (espessura) e pullover (extensão pura, sem bíceps limitar). Prioridade nº1 de largura; alvo 11–15 séries.",
 "Trapézio":"Trapézio superior recebe estímulo indireto em remadas e no esporte; 1–2 séries diretas bastam.",
 "Bíceps":"Bíceps braquial alongado (rosca inclinada) e braquial em pegada neutra. Volume indireto das puxadas conta 0,5. Com cotovelo sintomático, o neutro sai.",
 "Quadríceps":"Vasto lateral e intermédio em agachamento com joelho avançando; reto femoral só na extensora (cruza o quadril). Alvo 9–12 séries.",
 "Posterior":"Isquiotibiais: flexão de joelho (flexora sentada, quadril flexionado = mais comprimento) e dobradiça de quadril (RDL). Nordic curl reduz lesão de posterior em ~50% no futebol.",
 "Glúteo":"Glúteo máximo: alongado no agachamento, encurtado no hip thrust; os dois juntos cobrem a curva. Glúteo médio estabiliza a pelve (abdução).",
 "Panturrilha":"Gastrocnêmio com joelho estendido, sóleo com joelho flexionado. Pausa embaixo tira o reflexo do tendão e põe o músculo para trabalhar.",
 "Abdômen":"Reto abdominal responde a flexão de coluna com carga (crunch na polia) e retroversão pélvica (reverse crunch). Cintura menor é dieta, não abdominal.",
 "Core":"Anti-rotação e anti-flexão lateral transferem para base, passagem e queda. Isometria 20–45 s.",
 "Isometria":"Força isométrica é específica do ângulo e transfere mais quando treinada em comprimento maior (Oranchuk 2019). Submáxima com tendão sintomático; isometria não trata tendinopatia sozinha.",
 "Cardio":"Z2 melhora saúde cardiometabólica e recuperação sem comprometer hipertrofia (Schumann 2022). Corrida interfere mais que bike na fibra tipo I (Lundberg 2022).",
 "Hyrox":"Hyrox é corrida com estações: ritmo e resistência de força decidem mais que força máxima (Brandt 2025)."};
window.evidenciaPadrao=function(e){ return EVID[e.grupo]||""; };

// ---------- Escala RPE/RIR ----------
window.RIR_TXT={0:"Falha: não saía mais nenhuma",1:"Sairia mais 1",2:"Sairia mais 2",3:"Sairia mais 3",4:"Sairia 4 ou mais: leve demais"};

// ---------- Prescrição de proteína por refeição ----------
window.distribuiProteina=function(prot,refeicoes){ const n=refeicoes||4; const por=Math.round(prot/n/5)*5; return {n,por,txt:`${n} refeições com ~${por} g de proteína cada (0,4 g/kg por refeição, ISSN 2017). Uma delas até 2 h depois do treino.`}; };

// ---------- Tempo de descanso adaptativo (Singer 2024: ≥90 s; compostos 2–3 min para preservar carga) ----------
window.descansoSugerido=function(ex,rir){ const e=EX[ex]; if(!e) return 90; const comp=/Empurrar|Puxar|Agachar|Dobradiça|Extensão de quadril/.test(e.padrao)&&!/isométric/i.test(e.padrao); if(comp) return rir!=null&&rir<=1?180:150; return 90; };
})();

// Gerador de programa — Método DOSE
// Entrada: perfil (objetivo, dias/sem, equipamento, experiência, prioridades, esportes, flags de dor)
// Saída: programa no mesmo formato de window.PROGRAMS (rotacao + sessoes com slots {ex,sets,reps,rir,rest})
// Regras: ACSM 2026 (≥10 séries/grupo/sem, ≥80% 1RM para força), Pelland 2026 (indiretas 0,5; retornos decrescentes), Robinson 2024 (RIR 0-2 hipertrofia), Singer 2024 (descanso ≥90 s), Oranchuk 2019 (isometria).
(function(){
const POOL={ // padrão → exercícios por preferência (o modo de equipamento resolve o substituto)
 pressH:["supino_reto_smith","supino_reto_barra","supino_reto_halteres","flexao_solo"], pressI:["supino_inclinado_smith","supino_inclinado_barra","supino_inclinado_halteres","flexao_declinada"],
 pressV:["desenvolvimento_smith","desenvolvimento_maquina","desenvolvimento_halteres","pike_pushup"], abd:["elevacao_lateral_polia","elevacao_lateral_halteres","elevacao_lateral_band"],
 adH:["crossover","crucifixo_halteres"], triL:["triceps_overhead_polia","triceps_frances_halter","triceps_solo"], triS:["pressdown","triceps_coice_halter","triceps_solo"],
 pullV:["puxada_unilateral","puxada_frente","barra_fixa"], pullH:["remada_apoiada","remada_unilateral_polia","remada_smith","remada_unilateral_halter","remada_invertida"],
 ext:["pullover_polia","pullover_halter","pullover_band"], post:["crucifixo_inverso_polia","crucifixo_inverso_maquina","crucifixo_inverso_halteres","crucifixo_inverso_band"], trap:["encolhimento_smith","encolhimento_halteres"],
 bic:["rosca_inclinada","rosca_direta_smith","rosca_band"], bicN:["rosca_martelo_polia","rosca_martelo_halter"],
 squat:["agachamento_smith","hack","leg_press","goblet_squat","agachamento_corporal"], uni:["bulgarian_smith","afundo_reverso","step_up"], kneeExt:["extensora","extensora_band"],
 kneeFlex:["flexora","nordic_curl"], hinge:["rdl_smith","rdl_barra","rdl_halteres","good_morning_corporal"], hipExt:["hip_thrust_smith","hip_thrust_halter","ponte_gluteo"], hipAbd:["abducao_polia","abdutora","abducao_band"], kick:["kickback_polia","ponte_gluteo"],
 calfS:["panturrilha_smith","panturrilha_unilateral"], calfB:["soleo","panturrilha_unilateral"], core:["crunch_polia","reverse_crunch"], anti:["pallof_hold","pallof_band","prancha_lateral"]
};
const EQUIP={completa:["smith","barra","halteres","banco","polia","maquina","kettlebell","band","corpo","esteira","tornozeleira"],predio:["smith","polia","banco","maquina","halteres","band","corpo","esteira","tornozeleira"],livre:["barra","halteres","banco","kettlebell","corpo","band"],semequip:["corpo","band"]};
function pick(pattern, p, used){ const allowed=EQUIP[p.modo]||EQUIP.predio; for(const id of POOL[pattern]){ const e=window.EXERCISES.find(x=>x.id===id); if(!e||used.has(id)) continue; if(p.cotovelo&&e.flags&&e.flags.cotovelo&&/fora|suspens/i.test(e.flags.cotovelo)) continue; const ok=e.equip.some(q=>allowed.includes(q)); if(ok){ used.add(id); return id; } } return null; }
// Faixas por objetivo
const OBJ={ hipertrofia:{comp:{reps:"6–10",rir:"1–2",rest:"2–3 min"}, iso:{reps:"10–15",rir:"0–1",rest:"90 s"}, hi:{reps:"12–20",rir:"0–1",rest:"90 s"}},
 forca:{comp:{reps:"3–6",rir:"2–3",rest:"3 min"}, iso:{reps:"8–12",rir:"1–2",rest:"90 s"}, hi:{reps:"10–15",rir:"1",rest:"90 s"}},
 emagrecer:{comp:{reps:"6–10",rir:"1–2",rest:"2 min"}, iso:{reps:"10–15",rir:"0–1",rest:"75 s"}, hi:{reps:"12–20",rir:"0–1",rest:"60 s"}},
 saude:{comp:{reps:"8–12",rir:"2–3",rest:"2 min"}, iso:{reps:"10–15",rir:"1–2",rest:"90 s"}, hi:{reps:"12–20",rir:"1–2",rest:"60 s"}} };
// Multiplicador de volume por experiência
const EXP={iniciante:0.7, intermediario:1, avancado:1.15};
function S(n,p){ return Math.max(1,Math.round(n*(EXP[p.experiencia]||1))); }
function slot(ex,sets,kind,p,nota){ if(!ex) return null; const f=(OBJ[p.objetivoTreino]||OBJ.hipertrofia)[kind]; return Object.assign({ex,sets},f,nota?{nota}:{}); }
function clean(a){ return a.filter(Boolean); }

function buildPPL(p){ const u=new Set(); const pri=p.prioridades||[]; const P=k=>pri.includes(k);
  const push=clean([slot(pick('pressH',p,u),S(3,p),'comp',p,"Exposição de força."),slot(pick('pressI',p,u),S(2,p),'comp',p),slot(pick('abd',p,u),S(P('ombro')?4:3,p),'hi',p),slot(pick('adH',p,u),S(2,p),'iso',p),slot(pick('triL',p,u),S(2,p),'iso',p),slot(pick('triS',p,u),S(P('bracos')?2:1,p),'iso',p)]);
  const u2=new Set(); const pull=clean([slot(pick('pullV',p,u2),S(3,p),'comp',p,"Pesado e primeiro."),slot(pick('pullH',p,u2),S(3,p),'comp',p),slot(pick('ext',p,u2),S(P('costas')?3:2,p),'iso',p),slot(pick('post',p,u2),S(2,p),'hi',p),slot(pick('abd',p,u2),S(P('ombro')?2:1,p),'hi',p,"Segundo estímulo de deltoide lateral."),slot(pick('trap',p,u2),1,'iso',p),slot(pick('bic',p,u2),S(P('bracos')?3:2,p),'iso',p)]);
  const u3=new Set(); const legs=clean([slot(pick('squat',p,u3),S(3,p),'comp',p),slot(pick(P('gluteo')?'hipExt':'uni',p,u3),S(P('gluteo')?3:2,p),'comp',p),slot(pick('kneeExt',p,u3),S(2,p),'iso',p),slot(pick('kneeFlex',p,u3),S(3,p),'iso',p),slot(pick('hinge',p,u3),S(2,p),'comp',p),P('gluteo')?slot(pick('hipAbd',p,u3),S(2,p),'hi',p):null,slot(pick('calfS',p,u3),S(2,p),'iso',p),slot(pick('calfB',p,u3),S(2,p),'hi',p)]);
  return {rotacao:["push","pull","legs"],sessoes:{push:{nome:"PUSH",cor:"#8a3b31",slots:push,isometria:[{ex:"pallof_hold",sets:2,tempo:"20–30 s/lado"}],cardio:"15–20 min Z2 opcional"},pull:{nome:"PULL",cor:"#315E8A",slots:pull,isometria:[{ex:"remada_isometrica",sets:2,tempo:"15–30 s"}],cardio:"15–20 min Z2 ou bloco Hyrox leve"},legs:{nome:"LEGS",cor:"#4f6b3a",slots:legs,isometria:[{ex:"split_squat_hold",sets:2,tempo:"20–30 s/perna"},{ex:"aducao_isometrica",sets:2,tempo:"20–30 s"}],cardio:"15–20 min Z2"}}}; }
function buildUL(p){ const pri=p.prioridades||[]; const P=k=>pri.includes(k); const u=new Set();
  const upA=clean([slot(pick('pressH',p,u),S(3,p),'comp',p),slot(pick('pullV',p,u),S(3,p),'comp',p),slot(pick('pullH',p,u),S(3,p),'comp',p),slot(pick('pressV',p,u),S(2,p),'comp',p),slot(pick('abd',p,u),S(P('ombro')?3:2,p),'hi',p),slot(pick('triS',p,u),S(2,p),'iso',p),slot(pick('bic',p,u),S(2,p),'iso',p)]);
  const u2=new Set(); const loA=clean([slot(pick('squat',p,u2),S(3,p),'comp',p),slot(pick('hinge',p,u2),S(3,p),'comp',p),slot(pick('kneeExt',p,u2),S(2,p),'iso',p),slot(pick('kneeFlex',p,u2),S(3,p),'iso',p),slot(pick('uni',p,u2),S(2,p),'iso',p),slot(pick('calfS',p,u2),S(3,p),'iso',p),slot(pick('core',p,u2),S(2,p),'hi',p)]);
  const u3=new Set(); const upB=clean([slot(pick('pressI',p,u3),S(3,p),'comp',p),slot(pick('pullH',p,u3),S(3,p),'comp',p),slot(pick('pullV',p,u3),S(2,p),'comp',p),slot(pick('adH',p,u3),S(2,p),'iso',p),slot(pick('post',p,u3),S(2,p),'hi',p),slot(pick('abd',p,u3),S(2,p),'hi',p),slot(pick('bicN',p,u3)||pick('bic',p,u3),S(2,p),'iso',p),slot(pick('triL',p,u3),S(2,p),'iso',p)]);
  const u4=new Set(); const loB=clean([slot(pick('squat',p,u4),S(3,p),'comp',p),slot(pick('kneeFlex',p,u4),S(3,p),'iso',p),slot(pick('hipExt',p,u4),S(3,p),'comp',p),slot(pick('hipAbd',p,u4),S(P('gluteo')?3:2,p),'hi',p),slot(pick('uni',p,u4),S(2,p),'iso',p),slot(pick('calfB',p,u4),S(3,p),'hi',p),slot(pick('anti',p,u4),2,'hi',p)]);
  return {rotacao:["upperA","lowerA","upperB","lowerB"],sessoes:{upperA:{nome:"UPPER A",cor:"#8a3b31",slots:upA,cardio:"opcional"},lowerA:{nome:"LOWER A",cor:"#4f6b3a",slots:loA,cardio:"15 min Z2"},upperB:{nome:"UPPER B",cor:"#315E8A",slots:upB,cardio:"opcional"},lowerB:{nome:"LOWER B",cor:"#4f6b3a",slots:loB,cardio:"15 min Z2"}}}; }
function buildFB(p){ const pri=p.prioridades||[]; const P=k=>pri.includes(k);
  const mk=(a,b,c)=>{ const u=new Set(); return clean([slot(pick(a,p,u),S(3,p),'comp',p),slot(pick(b,p,u),S(3,p),'comp',p),slot(pick(c,p,u),S(3,p),'comp',p),slot(pick('pullH',p,u),S(3,p),'comp',p),slot(pick('abd',p,u),S(2,p),'hi',p),slot(pick(P('gluteo')?'hipExt':'kneeFlex',p,u),S(2,p),'iso',p),slot(pick('anti',p,u),2,'hi',p)]); };
  return {rotacao:["fbA","fbB","fbC"].slice(0,Math.max(2,Math.min(3,p.dias))),sessoes:{fbA:{nome:"FULL BODY A",cor:"#8a3b31",slots:mk('squat','pressH','pullV'),cardio:"10–15 min Z2"},fbB:{nome:"FULL BODY B",cor:"#315E8A",slots:mk('hinge','pressI','pullV'),cardio:"10–15 min Z2"},fbC:{nome:"FULL BODY C",cor:"#4f6b3a",slots:mk('uni','pressV','pullH'),cardio:"10–15 min Z2"}}}; }

window.gerarPrograma=function(p){
  const dias=+p.dias||4; let g, split, nome;
  if(dias<=2){ g=buildFB(p); split="Full body"; } else if(dias===3){ g=p.experiencia==="avancado"?buildPPL(p):buildFB(p); split=p.experiencia==="avancado"?"PPL (3 dias)":"Full body"; } else if(dias===4){ g=p.preferSplit==="ppl"?buildPPL(p):buildUL(p); split=p.preferSplit==="ppl"?"PPL rotativo":"Upper/Lower A-B"; } else { g=buildPPL(p); split="PPL rotativo"; }
  nome=`DOSE · ${split} · ${({hipertrofia:"hipertrofia",forca:"força",emagrecer:"perder gordura",saude:"saúde"})[p.objetivoTreino]||"hipertrofia"} · ${dias}×/sem`;
  const semana={}; const dsem=["seg","ter","qua","qui","sex","sab","dom"]; const musc=p.diasMusc&&p.diasMusc.length?p.diasMusc:(dias>=5?["seg","ter","qua","qui","sex"]:dias===4?["seg","ter","qui","sex"]:dias===3?["seg","qua","sex"]:["ter","qui"]); dsem.forEach(d=>semana[d]={bjj:(p.diasBjj||[]).includes(d)?true:false,musc:musc.includes(d)?"rotação":null});
  const principios=[`Split escolhido por ${dias} dias e nível ${p.experiencia||"intermediário"}. ${dias>=5?"PPL distribui o volume em sessões curtas.":dias===4?"Upper/Lower treina cada grupo 2× por semana.":"Full body garante frequência 2× com poucos dias."}`,
   `Objetivo ${p.objetivoTreino||"hipertrofia"}: compostos ${OBJ[p.objetivoTreino||"hipertrofia"].comp.reps} reps a RIR ${OBJ[p.objetivoTreino||"hipertrofia"].comp.rir}; isoladores ${OBJ[p.objetivoTreino||"hipertrofia"].iso.reps} a RIR ${OBJ[p.objetivoTreino||"hipertrofia"].iso.rir}.`,
   p.prioridades&&p.prioridades.length?`Prioridades (${p.prioridades.join(", ")}) recebem séries extras.`:"Sem prioridade declarada: volume equilibrado por grupo.",
   p.cotovelo?"Cotovelo sintomático: exercícios suspensos foram excluídos.":"", p.joelho?"Joelho sintomático: respeite o ângulo indolor; o app marca os exercícios de atenção.":"",
   (p.diasBjj||[]).length>=4?"4+ BJJ na semana: se a fadiga subir, corte acessórios antes dos compostos.":"",
   "Progressão: topo da faixa nas working sets → sobe carga. Deload a cada 4–6 semanas."].filter(Boolean);
  return Object.assign({id:"gerado",nome,origem:"Gerado pelo Método DOSE em "+new Date().toISOString().slice(0,10),principios,semana,regras:["O programa é contínuo: o próximo da rotação é o próximo, não depende do dia.","Semana pesada de esporte: acessórios saem, compostos ficam.","Dor subindo em duas sessões: deload antecipado."],volumeAlvo:{"Peitoral":"9–11","Latíssimo/dorsal":"11–15","Deltoide lateral":"8–10","Deltoide posterior":"6–9","Bíceps":"7–10","Tríceps":"8–11","Quadríceps":"9–12","Posteriores":"7–10","Glúteos":"7–10","Panturrilhas":"5–8"}},g);
};
})();

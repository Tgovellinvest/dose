// Guia de Treino — núcleo: estado, armazenamento local, roteamento, cálculos
// Todos os dados pessoais ficam SÓ neste aparelho (localStorage). Nada vai para o repositório.
const EX = Object.fromEntries(window.EXERCISES.map(e=>[e.id,e]));
const DB_KEY = 'guia-treino-v1';
const DEFAULT = {
  perfil:{nome:"", sexo:"m", idade:null, altura:null, peso:null, bf:null, atividade:"mod", objetivo:"manter", programa:"ul_4", modo:"completa", esporteFoco:"", cotovelo:false, joelho:false, experiencia:"intermediario", pesoAlvo:null, bfAlvo:null, metaEsporte:"", esportes:{}, diasMusc:[], enfaseEsporte:true, prioridades:[], protocoloCoach:{kcal:null,p:null,c:null,g:null,fonte:""}},
  rotacao:{ppl2:0, predio:0},
  logs:[],        // {id,data,programa,sessao,nome,sets:[{ex,set,peso,reps,rir,done}],dur,bjj,dorCot,dorJo,dores:{local:0-10},notas}
  cardio:[],      // {data,tipo,min,fc,dist,rpe,fonte}
  bjj:[],         // {data,tipo:'gi'|'nogi',min,rpe}
  checkins:[],    // {data,peso,cintura,peito,braco,coxa,sono,fadiga,passos,energia,notas}
  exames:[],      // {data,marcador,valor,unidade,ref,fonte}
  pesos:{},       // ultima carga por exercicio {ex:{peso,reps}}
  medalhasVistas:[], tema:"dark"
};
let S = load();
function load(){ try{ const j=JSON.parse(localStorage.getItem(DB_KEY)); if(j) return Object.assign({},DEFAULT,j,{perfil:Object.assign({},DEFAULT.perfil,j.perfil||{})}); }catch(e){} return JSON.parse(JSON.stringify(DEFAULT)); }
function save(){ try{ localStorage.setItem(DB_KEY, JSON.stringify(S)); }catch(e){ toast("Não consegui salvar (armazenamento bloqueado)"); } }
function uid(){ return Math.random().toString(36).slice(2,9)+Date.now().toString(36); }
function today(){ const d=new Date(); return d.toISOString().slice(0,10); }
function fmtD(s){ if(!s) return "—"; const [y,m,d]=s.split("-"); return `${d}/${m}`; }
function fmtDL(s){ if(!s) return "—"; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; }
function toast(m){ const t=document.getElementById('toast'); t.textContent=m; t.classList.remove('hidden'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.add('hidden'),2200); }
function esc(s){ return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function num(v){ const n=parseFloat(String(v).replace(',','.')); return isFinite(n)?n:null; }

// ---------- Modo de equipamento: resolve o exercício certo ----------
const MODOS = {completa:"Academia completa", predio:"Academia de prédio (Smith + polia)", box:"Box / CrossFit (barra, kettlebell, anilhas)", home:"Home gym (halteres ajustáveis, banco, elásticos)", livre:"Só pesos livres (barra e halteres)", kettle:"Kettlebell e elásticos", hotel:"Hotel (halteres leves, esteira)", semequip:"Sem equipamento (peso do corpo)"};
if(window.MODOS_V3) Object.assign(MODOS,window.MODOS_V3);
function resolveEx(id){
  const e = EX[id]; if(!e) return null;
  const modo = S.perfil.modo;
  const alt = e.modo && e.modo[modo];
  if(alt && EX[alt]) return EX[alt];
  // Modo sem substituto declarado: procura no mesmo padrão de movimento um exercício que o equipamento permite
  const allowed=(window.EQUIP||{})[modo]; const main=(e.equip||[]).filter(q=>q!=='banco'); if(allowed&&main.length&&!main.some(q=>allowed.includes(q))&&window.POOL){ const pat=Object.keys(window.POOL).find(k=>window.POOL[k].includes(id)); if(pat){ for(const cand of window.POOL[pat]){ const c=EX[cand]; const cm=(c?c.equip:[]).filter(q=>q!=='banco'); if(c&&cm.length&&cm.some(q=>allowed.includes(q))) return c; } } }
  return e;
}
function flagsAtivas(e){
  const f=[]; if(!e.flags) return f;
  if(S.perfil.cotovelo && e.flags.cotovelo) f.push({k:"cotovelo",t:e.flags.cotovelo});
  if(S.perfil.joelho && e.flags.joelho) f.push({k:"joelho",t:e.flags.joelho});
  if(e.flags.ombro) f.push({k:"ombro",t:e.flags.ombro});
  return f;
}
function suspenso(e){ return S.perfil.cotovelo && e.flags && e.flags.cotovelo && /fora|suspens/i.test(e.flags.cotovelo); }

// ---------- Programa e rotação ----------
function programa(){ return window.PROGRAMS[S.perfil.programa] || window.PROGRAMS.ppl2; }
function proximaSessaoId(){ const p=programa(); const i=(S.rotacao[p.id]||0)%p.rotacao.length; return p.rotacao[i]; }
function avancaRotacao(){ const p=programa(); S.rotacao[p.id]=((S.rotacao[p.id]||0)+1)%p.rotacao.length; save(); }
function diaSemana(d=new Date()){ return ["dom","seg","ter","qua","qui","sex","sab"][d.getDay()]; }
// Semana do usuário: dias de musculação e de esporte vêm do perfil (onboarding). Sem perfil preenchido, cai no programa.
function semanaUsuario(){ const pf=S.perfil; const out={}; const dsem=["seg","ter","qua","qui","sex","sab","dom"]; const temPerfil=(pf.diasMusc&&pf.diasMusc.length)||Object.keys(pf.esportes||{}).length;
  const base=programa().semana||window.PROGRAMS.ppl2.semana;
  dsem.forEach(d=>{ if(temPerfil){ const esp=Object.entries(pf.esportes||{}).filter(([k,dias])=>(dias||[]).includes(d)).map(([k])=>k); out[d]={musc:(pf.diasMusc||[]).includes(d)?"rotação":null, esportes:esp, bjj:esp.includes("bjj")?"fixo":null}; }
    else { const b=base[d]||{}; out[d]={musc:b.musc||null, esportes:b.bjj?["bjj"]:[], bjj:b.bjj||null}; } });
  return out; }
function planoHoje(){
  const p=programa(); const ds=diaSemana(); const sem=semanaUsuario()[ds];
  const prox=proximaSessaoId();
  const musc=sem.musc?prox:null; // sempre o próximo da rotação (programa contínuo)
  const esp=(sem.esportes||[]).map(k=>(window.SPORTS.find(s=>s.id===k)||{}).nome||k);
  let nota=""; if(musc&&esp.length) nota=`Dia com ${esp.join(" e ")}: musculação antes, ou separe ≥3 h. Se o esporte for duro, corte 1 série por exercício.`; else if(!musc&&esp.length) nota=`Hoje é ${esp.join(" e ")}. O próximo da rotação é ${p.sessoes[prox].nome}.`;
  return {dia:ds, bjj:sem.bjj, esportes:sem.esportes||[], musc, sessao:musc?p.sessoes[musc]:null, nota};
}

// ---------- Progressão (double progression) ----------
function sugestaoCarga(exId, repsFaixa){
  const last=S.pesos[exId]; if(!last) return null;
  const [mn,mx]=(repsFaixa||"").replace(/\/.*$/,'').split(/[–-]/).map(x=>parseInt(x)); if(!mx) return {peso:last.peso, txt:`Última: ${last.peso} kg × ${last.reps}`};
  if(last.reps>=mx && last.allTop) return {peso:last.peso, txt:`Bateu ${mx}/${mx} → sobe carga (+2–2,5 kg ou 1 placa)`, up:true};
  if(last.reps<mn) return {peso:last.peso, txt:`Ficou abaixo de ${mn} → ajuste a carga para baixo ou mantenha e revise fadiga`, down:true};
  return {peso:last.peso, txt:`Mantém ${last.peso} kg e busca +1 rep (última ${last.reps})`};
}

// ---------- Volume semanal por grupo (séries diretas + 0,5 indiretas) ----------
const INDIRETAS = {"Peitoral":{"Tríceps":0.5,"Ombro":0.3},"Dorsal":{"Bíceps":0.5,"Ombro":0.3,"Trapézio":0.3},"Quadríceps":{"Glúteo":0.5},"Posterior":{"Glúteo":0.5},"Glúteo":{},"Ombro":{"Tríceps":0.3}};
function volumeSemana(ref=new Date()){
  const ini=new Date(ref); ini.setDate(ini.getDate()-((ini.getDay()+6)%7)); const iniS=ini.toISOString().slice(0,10);
  const vol={};
  S.logs.filter(l=>l.data>=iniS).forEach(l=>{
    const porEx={}; l.sets.filter(s=>s.done).forEach(s=>{porEx[s.ex]=(porEx[s.ex]||0)+1;});
    Object.entries(porEx).forEach(([ex,n])=>{ const e=EX[ex]; if(!e) return; const g=e.grupo==="Isometria"||e.grupo==="Cardio"||e.grupo==="Hyrox"?null:e.grupo; if(!g) return; vol[g]=(vol[g]||0)+n; Object.entries(INDIRETAS[g]||{}).forEach(([g2,f])=>{vol[g2]=(vol[g2]||0)+n*f;}); });
  });
  return vol;
}
const ALVO = {"Peitoral":[9,11],"Dorsal":[11,15],"Ombro":[8,10],"Trapézio":[2,4],"Bíceps":[7,10],"Tríceps":[8,11],"Quadríceps":[9,12],"Posterior":[7,10],"Glúteo":[7,10],"Panturrilha":[5,8],"Abdômen":[3,6],"Core":[2,6]};

// ---------- Nutrição (conservadora) ----------
function calcNutri(p){
  const {sexo,idade,altura,peso,bf,atividade,objetivo}=p; if(!idade||!altura||!peso) return null;
  const ms = sexo==="m" ? 10*peso+6.25*altura-5*idade+5 : 10*peso+6.25*altura-5*idade-161;
  const eq=[{n:"Mifflin-St Jeor",v:ms}];
  let ffm=null;
  if(bf){ ffm=peso*(1-bf/100); eq.push({n:"Cunningham (massa magra)",v:500+22*ffm}); eq.push({n:"Katch-McArdle",v:370+21.6*ffm}); }
  const tmb=Math.min(...eq.map(e=>e.v));
  const atSel=window.NUTRI.atividade.find(a=>a.k===atividade)||window.NUTRI.atividade[2];
  // Regra DOSE: o gasto é calculado com 1,5 dia de treino a menos do que a pessoa informa (quem se declara muito ativo costuma superestimar).
  // Dias informados: da semana do perfil (musculação + esportes) quando preenchida; senão, pelo nível de atividade escolhido.
  const diasPerfil=(p.diasMusc||[]).length+Object.values(p.esportes||{}).reduce((a,x)=>a+(x||[]).length,0); const diasNivel=({sed:0,leve:1.5,mod:3.5,alto:6,muito:9})[atSel.k]; const diasInformados=diasPerfil>0?diasPerfil:(diasNivel??3.5);
  // Regra DOSE v4.1 (pedido do Tiago, 2026-10-26: "bem mais conservador"): além de tirar 1,5 dia, o fator satura em 6 dias e o teto é 1,45 (o "moderado" das tabelas). Ninguém é calculado como "muito ativo".
  const diasCalc=Math.min(6,Math.max(0,diasInformados-1.5));
  // Fator reduzido por dias/semana (interpolação): 0→1,15 · 1,5→1,25 · 3,5→1,35 · 5→1,42 · 6→1,45 (teto)
  const pts=[[0,1.15],[1.5,1.25],[3.5,1.35],[5,1.42],[6,1.45]]; let fc=1.45; for(let i=1;i<pts.length;i++){ if(diasCalc<=pts[i][0]){ const [x0,y0]=pts[i-1],[x1,y1]=pts[i]; fc=y0+(y1-y0)*(diasCalc-x0)/(x1-x0); break; } } fc=Math.round(fc*1000)/1000;
  const at=Object.assign({},atSel,{fc,diasInformados,diasCalc});
  const tdee=tmb*fc; const tdeePadrao=tmb*atSel.f;
  const ob=window.NUTRI.objetivos.find(o=>o.k===objetivo)||window.NUTRI.objetivos[0];
  let alvo=Math.floor(tdee*(1+ob.d)/25)*25; if(alvo<tmb && ob.d<0) alvo=Math.round(tmb);
  const protMin = ffm? Math.max(1.6*peso,2.3*ffm) : 1.6*peso; const protMax = ffm? Math.min(3.1*ffm,2.4*peso) : 2.2*peso;
  const prot = ob.d<0 ? Math.round((protMin+protMax)/2) : Math.round(protMin+ (protMax-protMin)*0.3);
  const gordMin=Math.max(0.6*peso, alvo*0.2/9); const gord=Math.round(Math.min(Math.max(gordMin,0.8*peso), alvo*0.3/9));
  const carb=Math.max(0, Math.round((alvo-prot*4-gord*9)/4));
  const perdaSem=ob.d<0? -(tdee-alvo)*7/7700 : (alvo-tdee)*7/7700;
  const agua=Math.round(peso*35/100)/10;
  return {eq,tmb:Math.round(tmb),tdee:Math.round(tdee),tdeePadrao:Math.round(tdeePadrao),alvo:Math.round(alvo),prot,gord,carb,ffm:ffm?Math.round(ffm*10)/10:null,perdaSem:Math.round(perdaSem*100)/100,agua,pctPerda: Math.round(Math.abs(perdaSem)/peso*1000)/10,fator:at};
}

// ---------- Medalhas ----------
function streakSemanas(){ // semanas consecutivas com ≥3 sessões (musc+bjj+cardio)
  const datas=[...S.logs.map(l=>l.data),...S.bjj.map(b=>b.data),...S.cardio.map(c=>c.data)]; if(!datas.length) return 0;
  const sem=d=>{const x=new Date(d); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x.toISOString().slice(0,10);};
  const cnt={}; datas.forEach(d=>{cnt[sem(d)]=(cnt[sem(d)]||0)+1;});
  let s=0; let w=new Date(); w.setDate(w.getDate()-((w.getDay()+6)%7));
  for(let i=0;i<104;i++){ const k=w.toISOString().slice(0,10); if((cnt[k]||0)>=3) s++; else if(i>0) break; w.setDate(w.getDate()-7); }
  return s;
}
function medalhas(){
  const nMusc=S.logs.length, nBjj=S.bjj.length, minZ2=S.cardio.filter(c=>/z2|base|caminh/i.test(c.tipo)).reduce((a,c)=>a+(c.min||0),0), nHyrox=S.cardio.filter(c=>/hyrox/i.test(c.tipo)).length, nCorr=S.cardio.filter(c=>/corrida|trote|intervalado|esteira/i.test(c.tipo)).length, nBoxe=S.cardio.filter(c=>/boxe/i.test(c.tipo)).length, nFut=S.cardio.filter(c=>/futebol/i.test(c.tipo)).length, nNat=S.cardio.filter(c=>/nata/i.test(c.tipo)).length;
  const prs=Object.keys(S.pesos).length; const ck=S.checkins.length; const st=streakSemanas();
  const pesos=S.checkins.filter(c=>c.peso).map(c=>c.peso); const perdido = pesos.length>1? Math.max(...pesos)-pesos[pesos.length-1]:0;
  const cint=S.checkins.filter(c=>c.cintura).map(c=>c.cintura); const cintPerdida = cint.length>1? Math.max(...cint)-cint[cint.length-1]:0;
  const tiers=(v,[a,b,c])=>v>=c?3:v>=b?2:v>=a?1:0;
  const list=[
   {cat:"Força",ico:"strength",nome:"Sessões de força",v:nMusc,t:[1,25,100],un:"sessões"},
   {cat:"Força",ico:"progress",nome:"Exercícios com PR registrado",v:prs,t:[5,15,30],un:"exercícios"},
   {cat:"Tatame",ico:"bjj",nome:"Treinos no tatame",v:nBjj,t:[10,50,150],un:"treinos"},
   {cat:"Arena",ico:"flame",nome:"Blocos Hyrox",v:nHyrox,t:[1,8,24],un:"blocos"},
   {cat:"Asfalto",ico:"run",nome:"Sessões de corrida/esteira",v:nCorr,t:[3,20,60],un:"sessões"},
   {cat:"Base",ico:"heart",nome:"Minutos em Z2",v:minZ2,t:[60,600,2000],un:"min"},
   {cat:"Ringue",ico:"box",nome:"Sessões de boxe",v:nBoxe,t:[1,10,30],un:"sessões"},
   {cat:"Campo",ico:"football",nome:"Jogos/sessões",v:nFut,t:[1,10,30],un:"sessões"},
   {cat:"Piscina",ico:"swim",nome:"Sessões na piscina",v:nNat,t:[1,10,30],un:"sessões"},
   {cat:"Constância",ico:"calendar",nome:"Semanas seguidas (≥3 treinos)",v:st,t:[2,6,12],un:"semanas"},
   {cat:"Prova",ico:"ruler",nome:"Check-ins semanais",v:ck,t:[1,8,24],un:"check-ins"},
   {cat:"Forma",ico:"scale",nome:"Quilos abaixo do máximo registrado",v:Math.round(perdido*10)/10,t:[2,10,25],un:"kg"},
   {cat:"Forma",ico:"ruler",nome:"Centímetros de cintura a menos",v:Math.round(cintPerdida*10)/10,t:[2,8,20],un:"cm"}
  ];
  return list.map(m=>({...m,tier:tiers(m.v,m.t),prox:m.t.find(x=>x>m.v)||null}));
}
const TIER={0:"—",1:"Bronze",2:"Prata",3:"Ouro"};

// ---------- Timer de descanso ----------
let timer={end:0,int:null}; window.timer=timer;
function startTimer(sec){ const el0=document.getElementById('timerVal'); if(el0){ el0.classList.remove('up'); el0.classList.add('run'); } timer.end=Date.now()+sec*1000; clearInterval(timer.int); timer.int=setInterval(tickTimer,250); tickTimer(); }
function tickTimer(){ const el=document.getElementById('timerVal'); if(!el){clearInterval(timer.int);return;} const r=Math.max(0,Math.round((timer.end-Date.now())/1000)); el.textContent=`${String(Math.floor(r/60)).padStart(2,'0')}:${String(r%60).padStart(2,'0')}`; const pill=document.getElementById('timerPill'); if(pill){ pill.textContent=el.textContent; pill.classList.toggle('run',r>0); } if(r<=0){clearInterval(timer.int); el.classList.add("up"); el.classList.remove("run"); if(pill) pill.classList.remove('show'); if(navigator.vibrate) navigator.vibrate([200,100,200]); if(window.avisaFim) window.avisaFim();} }
function parseRest(s){ const m=String(s||"90 s").match(/([\d,\.]+)\s*(min|s)/); if(!m) return 90; const v=parseFloat(m[1].replace(',','.')); return m[2]==="min"?Math.round(v*60):Math.round(v); }

// ---------- YouTube ----------
function ytId(u){ if(!u) return null; const m=u.match(/(?:v=|shorts\/|youtu\.be\/)([\w-]{11})/); return m?m[1]:null; }
function ytEmbed(u){ const id=ytId(u); if(!id) return ""; const vert=/shorts/.test(u); return `<div class="video ${vert?'vert':''}"><iframe src="https://www.youtube.com/embed/${id}?rel=0&playsinline=1" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`; }

// ---------- Export / import ----------
function exportJSON(){ const blob=new Blob([JSON.stringify(S,null,1)],{type:"application/json"}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`guia-treino-backup-${today()}.json`; a.click(); }
function importJSON(file){ const r=new FileReader(); r.onload=()=>{ try{ const j=JSON.parse(r.result); if(!j.perfil) throw 0; S=Object.assign({},DEFAULT,j); save(); toast("Backup restaurado"); route(); }catch(e){ toast("Arquivo inválido"); } }; r.readAsText(file); }
// CSV genérico: data,peso,cintura,passos,sono,fc_repouso,hrv  (cabeçalho obrigatório)
function importCSV(file){ const r=new FileReader(); r.onload=()=>{ const lines=r.result.split(/\r?\n/).filter(Boolean); const h=lines[0].toLowerCase().split(/[;,]/).map(x=>x.trim()); let n=0;
  lines.slice(1).forEach(l=>{ const c=l.split(/[;,]/); const o={}; h.forEach((k,i)=>o[k]=c[i]); const data=(o.data||o.date||"").slice(0,10).replace(/\//g,'-'); if(!/^\d{4}-\d{2}-\d{2}$/.test(data)) return;
    const ck={id:uid(),data,peso:num(o.peso||o.weight),cintura:num(o.cintura||o.waist),passos:num(o.passos||o.steps),sono:num(o.sono||o.sleep),fcrep:num(o.fc_repouso||o.resting_hr||o.rhr),hrv:num(o.hrv),fonte:"csv"};
    const ex=S.checkins.find(x=>x.data===data); if(ex) Object.keys(ck).forEach(k=>{if(ck[k]!=null&&k!=='id') ex[k]=ck[k];}); else S.checkins.push(ck); n++; });
  S.checkins.sort((a,b)=>a.data.localeCompare(b.data)); save(); toast(`${n} linhas importadas`); route(); }; r.readAsText(file); }

// ---------- Roteamento ----------
let R={r:"hoje",p:{}};
function go(r,p={}){ R={r,p}; location.hash=r+(Object.keys(p).length?"?"+new URLSearchParams(p):""); }
function applyTheme(){ document.documentElement.dataset.theme=S.perfil.tema||S.tema||"dark"; }
function route(){ applyTheme(); const [r,q]=location.hash.replace('#','').split('?'); R={r:r||"hoje",p:Object.fromEntries(new URLSearchParams(q||""))};
  const maisRoutes=['esportes','calendario','gerador','tutorial','mais','grupos']; document.querySelectorAll('.tabbar button').forEach(b=>b.classList.toggle('on', b.dataset.r===R.r || R.r.startsWith(b.dataset.r) || (b.dataset.r==='mais'&&maisRoutes.includes(R.r)) || (b.dataset.r==='treino'&&(R.r==='sessao'||R.r==='exercicio'||R.r==='ficha'))));
  document.getElementById('modeBadge').textContent=({completa:"Academia",predio:"Prédio",box:"Box",home:"Home gym",livre:"Pesos livres",kettle:"Kettlebell",hotel:"Hotel",semequip:"Sem equip."})[S.perfil.modo]||"";
  const v=window.VIEWS[R.r]||window.VIEWS.hoje; const html=v(R.p); const el=document.getElementById('view'); el.innerHTML=html; window.scrollTo(0,0);
  if(window.AFTER[R.r]) window.AFTER[R.r](R.p);
}
window.addEventListener('hashchange',route);
document.getElementById('tabbar').addEventListener('click',e=>{const b=e.target.closest('button'); if(b) go(b.dataset.r);});
function sheet(html){ const s=document.getElementById('sheet'); document.getElementById('sheetBody').innerHTML=html; s.classList.remove('hidden'); }
function closeSheet(){ document.getElementById('sheet').classList.add('hidden'); }
document.getElementById('sheet').addEventListener('click',e=>{ if(e.target.id==='sheet') closeSheet(); });
window.addEventListener('DOMContentLoaded',()=>{ document.querySelectorAll('.tabbar i[data-i]').forEach(el=>el.innerHTML=I(el.dataset.i)); if(!location.hash) location.hash="hoje"; route(); });

// ================= DOSE · Ficha do personal (v4.9) =================
// A DOSE não compete com o personal: importa a ficha dele e organiza tudo em volta (sessão guiada, timer, carga, progressão, dose, nutrição, peso).
// Regras do modo personal: nunca troca exercício, nunca muda séries/reps, nunca regenera. Dor e dose viram AVISO, não mudança.
(function(){
const V=window.VIEWS, A=window.AFTER;
const norm=t=>String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const ehPersonal=()=>{ const pr=programa(); return pr&&pr.id==='custom'&&S.custom&&S.custom.personal!==false; };
window.ehFichaPersonal=ehPersonal;

// ---------- Exercícios da ficha (nome do personal, técnica do vínculo) ----------
function registrarExPersonal(){ (S.exPersonal||[]).forEach(x=>{ const base=x.base&&EX[x.base]?EX[x.base]:null; const o=Object.assign({sub:"",padrao:"",equip:[],cues:[],erros:[],flags:{},modo:{}},base||{},{id:x.id,nome:x.nome,grupo:x.grupo||(base?base.grupo:"Outro"),base:x.base||null,personal:true}); o.sub=base?`${base.sub} · técnica: ${base.nome}`:"Exercício da ficha do seu personal"; if(!base){ o.modo={}; o.flags={}; } EX[x.id]=o; if(!window.EXERCISES.some(e=>e.id===x.id)) window.EXERCISES.push(o); }); }
window.registrarExPersonal=registrarExPersonal; try{ registrarExPersonal(); if(window.registrarProgramas) registrarProgramas(); }catch(e){}

// ---------- Vínculo com a biblioteca (para vídeo e técnica) ----------
const SIN=[["supino","supino"],["peck deck","voador"],["voador","voador"],["crucifixo","crucifixo"],["puxada","puxada"],["pulldown","puxada"],["pull down","puxada"],["remada","remada"],["barra fixa","barra fixa"],["agachamento","agachamento"],["agacho","agachamento"],["leg press","leg press"],["legpress","leg press"],["hack","hack"],["cadeira extensora","extensora"],["extensora","extensora"],["mesa flexora","flexora"],["cadeira flexora","flexora"],["flexora","flexora"],["stiff","stiff"],["terra romeno","rdl"],["rdl","rdl"],["levantamento terra","terra"],["elevacao pelvica","elevacao pelvica"],["hip thrust","elevacao pelvica"],["gluteo","gluteo"],["abducao","abducao"],["abdutora","abducao"],["aducao","aducao"],["adutora","aducao"],["afundo","afundo"],["passada","afundo"],["bulgaro","bulgaro"],["desenvolvimento","desenvolvimento"],["elevacao lateral","elevacao lateral"],["elevacao frontal","elevacao frontal"],["crucifixo inverso","crucifixo inverso"],["face pull","face pull"],["rosca","rosca"],["triceps","triceps"],["testa","testa"],["frances","frances"],["corda","corda"],["mergulho","mergulho"],["paralela","mergulho"],["panturrilha","panturrilha"],["abdominal","abdominal"],["prancha","prancha"],["encolhimento","encolhimento"],["pallof","pallof"]];
const EQW=["barra","halter","halteres","smith","maquina","polia","cabo","corda","banco","inclinado","declinado","reto","sentado","em pe","unilateral","kettlebell","elastico","livre","articulado","hammer","w","martelo","scott","alternada","pegada","supinada","pronada","neutra","aberta","fechada"];
// Regras explícitas (padrão → exercício da biblioteca). Primeira que bate vence; sem regra = sem vínculo (melhor nada que vídeo errado).
const REGRAS=[
 [/supino.*inclinad.*(halter)/,"supino_inclinado_halteres"],[/supino.*inclinad.*smith/,"supino_inclinado_smith"],[/supino.*inclinad/,"supino_inclinado_barra"],
 [/supino.*(halter)/,"supino_reto_halteres"],[/supino.*smith/,"supino_reto_smith"],[/supino/,"supino_reto_barra"],
 [/crucifixo.*invers|voador invers|peck deck invers|posterior de ombro/,"crucifixo_inverso_maquina"],[/crossover|crucifixo.*(polia|cabo|cross)/,"crossover"],[/crucifixo|voador|peck ?deck/,"crucifixo_halteres"],
 [/desenvolvimento.*(maquina|articulad)/,"desenvolvimento_maquina"],[/desenvolvimento.*smith/,"desenvolvimento_smith"],[/desenvolvimento/,"desenvolvimento_halteres"],
 [/elevacao lateral.*(polia|cabo)/,"elevacao_lateral_polia"],[/elevacao lateral.*elastic/,"elevacao_lateral_band"],[/elevacao lateral/,"elevacao_lateral_halteres"],
 [/triceps.*(corda|pulley|polia|barra reta|pressdown|puxador)|pressdown/,"pressdown"],[/(triceps )?frances.*(polia|cabo|corda)|overhead.*polia/,"triceps_overhead_polia"],[/frances|triceps testa|testa/,"triceps_frances_halter"],[/coice/,"triceps_coice_halter"],[/mergulho|paralela|triceps banco/,"triceps_solo"],
 [/puxada.*unilateral/,"puxada_unilateral"],[/puxada|pulldown|pull down|pulley costas/,"puxada_frente"],[/barra fixa|pull ?up|chin ?up/,"barra_fixa"],
 [/remada.*(serrote|unilateral.*halter|halter.*unilateral)|serrote/,"remada_unilateral_halter"],[/remada.*(baixa|sentad|triangulo|polia|cabo)/,"remada_unilateral_polia"],[/remada.*(apoiad|maquina|articulad|cavalinho|t ?bar)/,"remada_apoiada"],[/remada.*smith/,"remada_smith"],[/remada.*invertid/,"remada_invertida"],[/remada/,"remada_smith"],
 [/pullover.*(polia|cabo)/,"pullover_polia"],[/pullover/,"pullover_halter"],
 [/encolhimento.*smith/,"encolhimento_smith"],[/encolhimento/,"encolhimento_halteres"],
 [/rosca.*inclinad/,"rosca_inclinada"],[/rosca.*martelo.*(polia|corda)/,"rosca_martelo_polia"],[/rosca.*martelo|martelo/,"rosca_martelo_halter"],[/rosca.*(direta|barra|w\b|smith|scott)/,"rosca_direta_smith"],[/rosca/,"rosca_inclinada"],
 [/agachamento.*bulgar|bulgar/,"bulgarian_smith"],[/goblet/,"goblet_squat"],[/agachamento.*(smith)/,"agachamento_smith"],[/hack/,"hack"],[/leg ?press/,"leg_press"],[/agachamento.*(livre|barra)/,null],[/agachamento/,"agachamento_smith"],
 [/afundo|passada|avanco|lunge/,"afundo_reverso"],[/step ?up|subida no banco/,"step_up"],[/extensora/,"extensora"],[/flexora|mesa flexora/,"flexora"],[/nordic/,"nordic_curl"],
 [/(stiff|rdl|terra romeno).*(halter)/,"rdl_halteres"],[/(stiff|rdl|terra romeno).*smith/,"rdl_smith"],[/stiff|rdl|terra romeno/,"rdl_barra"],
 [/elevacao pelvica|hip ?thrust/,"hip_thrust_smith"],[/ponte/,"ponte_gluteo"],[/abdu.*(polia|cabo)/,"abducao_polia"],[/abdu.*(elastic|miniband|band)/,"abducao_band"],[/abdu/,"abdutora"],[/gluteo.*(polia|cabo|coice)|kickback/,"kickback_polia"],
 [/panturrilha.*sentad|soleo/,"soleo"],[/panturrilha/,"panturrilha_smith"],
 [/abdominal.*(polia|cabo|corda)|crunch.*polia/,"crunch_polia"],[/abdominal.*(infra|elevacao de pernas)|elevacao de pernas|infra/,"reverse_crunch"],[/prancha lateral/,"prancha_lateral"],[/pallof/,"pallof_band"],
 [/flexao/,"flexao_solo"],[/farmer/,"farmer_carry"]];
function vincular(nome){ const n=norm(nome); for(const [rx,id] of REGRAS){ if(rx.test(n)) return {e:id&&EX[id]?EX[id]:null,conf:id?"alta":"baixa"}; } return {e:null,conf:"baixa"}; }
const GRUPO_KW=[[/supino|peito|crucifixo|voador|peck|flexao/,"Peitoral"],[/puxada|remada|pulldown|barra fixa|dorsal|costas|serrote|pull/,"Dorsal"],[/agach|leg press|hack|extensora|quadri|afundo|passada|bulgar|sissy/,"Quadríceps"],[/stiff|flexora|terra|rdl|posterior|good morning/,"Posterior"],[/gluteo|elevacao pelvica|hip thrust|abdu|coice|ponte/,"Glúteo"],[/desenvolv|elevacao lateral|elevacao frontal|ombro|deltoide|face pull|crucifixo inverso/,"Ombro"],[/rosca|biceps/,"Bíceps"],[/triceps|testa|frances|mergulho|paralela|coice de triceps/,"Tríceps"],[/panturrilha|gemeos/,"Panturrilha"],[/abdom|prancha|core|oblíq|obliq|pallof|infra/,"Core"],[/encolhimento|trapezio/,"Trapézio"],[/adu/,"Glúteo"]];
const grupoKw=n=>{ const x=norm(n); return (GRUPO_KW.find(([rx])=>rx.test(x))||[])[1]||"Outro"; };

// ---------- Leitura do texto (WhatsApp, PDF, app do personal) ----------
const RX_SERIES=/(\d{1,2})\s*(?:x|×|X|\*)\s*([\d]{1,3}(?:\s*(?:-|–|a|\/|,)\s*\d{1,3})*|falha|max|máx|maximo|máximo)/i;
const RX_SERIES2=/(\d{1,2})\s*s[eé]ries?\s*(?:de\s*)?(\d{1,3}(?:\s*(?:-|–|a|\/)\s*\d{1,3})*)?\s*(?:rep|repeti)?/i;
const RX_REST=/(?:descanso|intervalo|pausa|desc\.?|int\.?)\s*(?:de\s*)?(\d{1,3})\s*(s|seg|segundos|"|''|min|m)?|(\d{1,3})\s*(s|seg|segundos|"|'')\s*(?:de\s*)?(?:descanso|intervalo|pausa)?|(\d(?:[.,]\d)?)\s*min(?:uto)?s?\s*(?:de\s*)?(?:descanso|intervalo|pausa)/i;
const RX_CARDIO=/^(esteira|bike|bicicleta|eliptico|elíptico|escada|corrida|caminhada|transport|remo erg|aquecimento|alongamento|mobilidade)/i;
const ehCabecalho=l=>{ const t=l.trim(); if(!t||RX_SERIES.test(t)||RX_SERIES2.test(t)) return false; if(/^(treino|sess[aã]o|ficha|dia|semana)\s*[a-z0-9]{0,3}\b/i.test(t)) return true; if(/^[A-F]\s*[-–:)\.]/.test(t)) return true; if(/^(segunda|terca|terça|quarta|quinta|sexta|sabado|sábado|domingo)\b/i.test(t)) return true; if(/:\s*$/.test(t)&&t.length<40) return true; const letras=t.replace(/[^A-Za-zÀ-ú]/g,""); return letras.length>=4&&letras===letras.toUpperCase()&&t.length<40; };
function lerLinha(l){ let t=l.replace(/^[\s>*•·\-–—\d]{0,4}[\.\)\-–:]\s*/,(m)=>/\d/.test(m)&&!/[\.\)]/.test(m)?m:"").replace(/^\s*[•·\-–—*]\s*/,"").replace(/^\s*\d{1,2}\s*[\.\)º°-]\s*/,"").trim();
  let sets=null,reps=null,rest=null,nota=[];
  let m=t.match(RX_SERIES); if(m){ sets=+m[1]; reps=/falha|max|máx|maximo|máximo/i.test(m[2])?"até a falha":m[2].replace(/\s*(?:\ba\b|–|-|\/|,)\s*/g,(x)=>/\/|,/.test(x)?"/":"–").replace(/\s+/g,""); t=t.replace(m[0]," "); }
  else { m=t.match(RX_SERIES2); if(m){ sets=+m[1]; reps=(m[2]||"").replace(/\s*(?:\ba\b|–|-)\s*/g,"–"); t=t.replace(m[0]," "); } }
  const r=t.match(RX_REST); if(r){ if(r[1]) rest=/min|^m$/i.test(r[2]||"")?`${r[1]} min`:`${r[1]} s`; else if(r[3]) rest=`${r[3]} s`; else if(r[5]) rest=`${String(r[5]).replace('.',',')} min`; t=t.replace(r[0]," "); }
  t=t.replace(/\(([^)]*)\)/g,(x,y)=>{ nota.push(y.trim()); return " "; });
  const extra=t.match(/\b(bi-?set|tri-?set|drop-?set|rest-?pause|cluster|cad[eê]ncia[^,;]*|at[eé] a falha)\b/ig); if(extra) nota.push(...extra.map(x=>x.toLowerCase()));
  if(extra) extra.forEach(x=>{ t=t.replace(new RegExp(x.replace(/[-]/g,"\\-"),"i")," "); }); t=t.replace(/\b(na|no|em) (ultima|última|primeira)\b/ig," ").replace(/\b(rep(eti[cç][oõ]es)?|reps?|s[eé]ries?|kg)\b/ig," ").replace(/[|;,]+/g," ").replace(/\s{2,}/g," ").replace(/^[\s\-–:.]+|[\s\-–:.]+$/g,"").trim();
  const nome=t.charAt(0).toUpperCase()+t.slice(1); return {nome,sets,reps,rest,nota:nota.filter(Boolean).join(" · ")}; }
window.lerFicha=function(txt){ const linhas=String(txt||"").replace(/\r/g,"").split("\n").map(x=>x.trim()).filter(x=>x&&!/^(obs|observa|aten[cç][aã]o|bom treino|💪|https?:)/i.test(x));
  const sess=[]; let cur=null; const nova=n=>{ cur={nome:n,itens:[],cardio:[]}; sess.push(cur); };
  for(const l of linhas){ if(ehCabecalho(l)){ nova(l.replace(/[:\-–]+\s*$/,"").replace(/\s{2,}/g," ").trim()); continue; }
    if(!cur) nova("Treino A");
    if(RX_CARDIO.test(l.replace(/^[\s\d\.\)\-•]+/,""))){ cur.cardio.push(l.replace(/^[\s\d\.\)\-•]+/,"")); continue; }
    const temSerie=RX_SERIES.test(l)||RX_SERIES2.test(l); if(!temSerie){ const n=norm(l); const pareceEx=grupoKw(l)!=="Outro"||REGRAS.some(([rx])=>rx.test(n)); if(!pareceEx||/[!?]|\p{Extended_Pictographic}/u.test(l)||l.split(/\s+/).length>8) continue; }
    const it=lerLinha(l); if(it.nome.length<3) continue; cur.itens.push(it); }
  return sess.filter(s=>s.itens.length||s.cardio.length).map((s,i)=>Object.assign(s,{nome:s.nome.length>40?s.nome.slice(0,40):s.nome})); };

// ---------- Tela: importar ----------
const EXEMPLO=`Treino A – Peito e tríceps
1. Supino reto com barra 4x8-10
2. Supino inclinado halteres 3x10 (descanso 90s)
3. Crucifixo máquina 3x12
4. Tríceps corda 3x12-15
Esteira 15 min

Treino B – Costas e bíceps
Puxada frente 4x10
Remada baixa 3x10
Rosca direta barra W 3x12
Abdominal infra 3x15`;
V.importar=(p)=>{ setTitle("Importar ficha"); const prev=window._impPrev;
  if(prev&&p.rev) return `<button class="btn sm ghost" onclick="go('importar')">‹ Voltar ao texto</button><h1>Confira a ficha</h1><p class="small">Os nomes ficam <b>como o seu personal escreveu</b>. Onde houver vínculo, a DOSE mostra vídeo e técnica do exercício equivalente. Toque para ajustar.</p>
    ${prev.map((s,si)=>`<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><input value="${esc(s.nome)}" onchange="_impPrev[${si}].nome=this.value" style="font-weight:800;margin:0"><span class="tiny" style="flex:none;margin-left:8px">${s.itens.length} exerc.</span></div>
      <div class="list" style="margin-top:8px">${s.itens.map((it,ii)=>`<div class="item" onclick="impEditar(${si},${ii})"><div class="n">${ii+1}</div><div class="t"><b>${esc(it.nome)}</b><span>${it.sets||"?"} × ${esc(it.reps||"?")}${it.rest?` · ${esc(it.rest)}`:""}${it.nota?` · ${esc(it.nota)}`:""}</span><span class="tiny" style="color:${it.v?'var(--ok)':'var(--tx3)'}">${it.v?`vídeo e técnica: ${esc(EX[it.v].nome)}`:"sem vínculo: só o nome do personal"}</span></div><span class="arrow">›</span></div>`).join("")}</div>
      ${s.cardio.length?`<p class="tiny" style="margin-top:6px">Cardio: ${s.cardio.map(esc).join(" · ")}</p>`:""}</div>`).join("")}
    ${prev.some(s=>s.itens.some(it=>!it.sets))?`<div class="card sub small" style="border-color:var(--warn)">Alguns exercícios vieram sem séries/reps. A DOSE usa 3 × 10 até você ajustar.</div>`:""}
    <label>Quem montou (aparece no relatório)</label><input id="impQuem" placeholder="Ex.: personal Ana, out/2026" value="${esc((S.custom&&S.custom.origem&&S.custom.origem!=='Criada por você')?S.custom.origem:'')}">
    <button class="btn em" style="margin-top:12px" onclick="impSalvar()">Usar esta ficha</button>
    <p class="tiny">A DOSE não muda exercícios, séries nem repetições desta ficha. Ela registra, cronometra, sugere a carga pela sua última sessão e avisa quando a dose do dia pede cuidado: quem decide é você e seu personal.</p>`;
  return `<button class="btn sm ghost" onclick="go('treino')">‹ Treino</button><h1>Importar seu treino</h1>
   <p class="small">Já tem um treino? Cole como recebeu: WhatsApp, PDF, e-mail ou app do personal. Um treino por bloco ("Treino A", "Segunda", "Costas e bíceps"…) e um exercício por linha, com séries × repetições.</p>
   <textarea id="impTxt" rows="12" style="width:100%;font-family:var(--num);font-size:14px;line-height:1.45" placeholder="${esc(EXEMPLO)}">${esc(window._impTxt||"")}</textarea>
   <div class="grid2" style="margin-top:8px"><button class="btn sec" onclick="impColar()">${I("plate")} Colar</button><button class="btn ghost" onclick="document.getElementById('impTxt').value=${JSON.stringify(EXEMPLO).replace(/"/g,'&quot;')}">Ver exemplo</button></div>
   <button class="btn em" style="margin-top:10px" onclick="impLer()">Ler a ficha</button>
   <div class="card sub small" style="margin-top:12px"><b>O que a DOSE entende:</b> 4x10 · 3x8-12 · 4 séries de 10 · 3x falha · descanso 60s / 1 min · (observações entre parênteses) · bi-set, drop-set, cada perna. Linhas de esteira/bike viram o cardio da sessão.</div>
   <p class="tiny">Ficha em foto? Por enquanto, monte manualmente em <a onclick="go('ficha')">Minha ficha</a> ou peça ao personal o texto.</p>`; };
window.impColar=async()=>{ try{ const t=await navigator.clipboard.readText(); if(t){ document.getElementById('impTxt').value=t; toast("Colado"); } else toast("Área de transferência vazia"); }catch(e){ toast("Toque e segure no campo para colar"); } };
window.impLer=()=>{ const t=document.getElementById('impTxt').value; window._impTxt=t; const s=lerFicha(t); if(!s.length||!s.some(x=>x.itens.length)) return toast("Não achei exercícios. Um por linha, com 4x10 etc.");
  s.forEach(se=>se.itens.forEach(it=>{ const v=vincular(it.nome); it.v=v.e?v.e.id:null; it.conf=v.conf; })); window._impPrev=s; go('importar',{rev:1}); };
window.impEditar=(si,ii)=>{ const it=_impPrev[si].itens[ii]; const sug=window.EXERCISES.filter(e=>!e.personal).map(e=>{ const n=norm(it.nome); const s=norm(e.nome).split(" ").filter(w=>n.includes(w)&&w.length>2).length; return [s,e]; }).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,6).map(x=>x[1]);
  sheet(`<h3>Ajustar exercício</h3><label>Nome (como o personal escreveu)</label><input id="ieN" value="${esc(it.nome)}"><div class="grid3"><div><label>Séries</label><input id="ieS" type="number" value="${it.sets||''}"></div><div><label>Reps</label><input id="ieR" value="${esc(it.reps||'')}"></div><div><label>Descanso</label><input id="ieD" value="${esc(it.rest||'')}" placeholder="90 s"></div></div><label>Observação do personal</label><input id="ieO" value="${esc(it.nota||'')}">
   <label>Vídeo e técnica de</label><select id="ieV"><option value="">— sem vínculo —</option>${(it.v&&!sug.some(e=>e.id===it.v)?[EX[it.v],...sug]:sug).map(e=>`<option value="${e.id}" ${e.id===it.v?'selected':''}>${esc(e.nome)}</option>`).join("")}<option disabled>──────</option>${window.EXERCISES.filter(e=>!e.personal).slice().sort((a,b)=>a.nome.localeCompare(b.nome)).map(e=>`<option value="${e.id}">${esc(e.nome)}</option>`).join("")}</select>
   <div class="grid2" style="margin-top:12px"><button class="btn ghost" onclick="_impPrev[${si}].itens.splice(${ii},1);closeSheet();route()">Remover</button><button class="btn em" onclick="Object.assign(_impPrev[${si}].itens[${ii}],{nome:ieN.value.trim(),sets:+ieS.value||null,reps:ieR.value.trim(),rest:ieD.value.trim(),nota:ieO.value.trim(),v:ieV.value||null});closeSheet();route()">Salvar</button></div>`); };
window.impSalvar=()=>{ const prev=window._impPrev; if(!prev) return; const quem=(document.getElementById('impQuem')||{}).value||"";
  const cores=["#8a3b31","#315E8A","#4f6b3a","#6b4f8a","#8a6b31","#31808a"]; const slug=t=>norm(t).replace(/ /g,"_").slice(0,40);
  S.exPersonal=S.exPersonal||[]; const c={id:"custom",nome:quem?`Ficha · ${quem}`:"Ficha do personal",origem:quem||"Ficha do personal",personal:true,importadaEm:today(),rotacao:[],sessoes:{}};
  prev.forEach((s,i)=>{ const sid="p"+(i+1)+"_"+Date.now().toString(36).slice(-4); c.sessoes[sid]={nome:s.nome,cor:cores[i%cores.length],cardio:s.cardio.join(" · "),slots:s.itens.map(it=>{ const id="pe_"+slug(it.nome); const ex={id,nome:it.nome,base:it.v||null,grupo:it.v&&EX[it.v]?EX[it.v].grupo:grupoKw(it.nome)}; const k=S.exPersonal.findIndex(x=>x.id===id); if(k>=0) S.exPersonal[k]=ex; else S.exPersonal.push(ex);
        return {ex:id,sets:it.sets||3,reps:it.reps||"10",rir:"",rest:it.rest||"90 s",nota:it.nota||"",personal:true}; })}; c.rotacao.push(sid); });
  if(S.custom&&S.custom.rotacao&&S.custom.rotacao.length) S.customAnterior=S.custom; S.custom=c; registrarExPersonal(); S.perfil.programa="custom"; S.rotacao.custom=0; save(); if(window.registrarProgramas) registrarProgramas(); window._impPrev=null; window._impTxt=""; toast("Ficha do personal em uso"); go('treino'); };

// ---------- Modo personal: a DOSE não mexe na ficha ----------
const _resolve=window.resolveEx; // resolveEx é function global do app.js
window.resolveEx=function(id){ const e=EX[id]; if(e&&(e.personal||(ehPersonal()&&S.custom.sessoes&&Object.values(S.custom.sessoes).some(s=>s.slots.some(x=>x.ex===id))))) return e; return _resolve(id); };
try{ resolveEx=window.resolveEx; }catch(e){}
const _susp=window.suspenso; window.suspenso=function(e){ if(ehPersonal()) return false; return _susp(e); }; try{ suspenso=window.suspenso; }catch(e){}

// ---------- Relatório para o personal ----------
const e1=s=>s.peso&&s.reps?s.peso*(1+s.reps/30):0;
window.relatorioPersonal=function(dias){ dias=dias||14; const ini=(()=>{ const x=new Date(); x.setDate(x.getDate()-dias+1); return x.ymd(); })(); const pr=programa();
  const logs=S.logs.filter(l=>l.data>=ini).sort((a,b)=>a.data.localeCompare(b.data)); const L=[];
  L.push(`*DOSE · relatório para o personal*`); L.push(`${S.perfil.nome||"Aluno"} · ${fmtDL(ini)} a ${fmtDL(today())}${S.custom&&S.custom.origem&&ehPersonal()?` · ficha: ${S.custom.origem}`:""}`); L.push("");
  const plan=(S.perfil.diasMusc||[]).length*Math.round(dias/7); L.push(`*Constância:* ${logs.length} ${logs.length===1?"sessão":"sessões"} de musculação${plan?` (planejado ≈ ${plan})`:""}${S.bjj.filter(b=>b.data>=ini).length?` · ${S.bjj.filter(b=>b.data>=ini).length} de esporte`:""}${S.cardio.filter(c=>c.data>=ini).length?` · ${S.cardio.filter(c=>c.data>=ini).length} de cardio`:""}`);
  const porEx={}; logs.forEach(l=>l.sets.filter(s=>s.done&&s.peso&&s.reps).forEach(s=>{ (porEx[s.ex]=porEx[s.ex]||[]).push({d:l.data,peso:s.peso,reps:s.reps,e:e1(s)}); }));
  const linhas=Object.entries(porEx).map(([id,a])=>{ const dias=[...new Set(a.map(x=>x.d))]; const melhorDe=d=>a.filter(x=>x.d===d).sort((x,y)=>y.e-x.e)[0]; const pri=melhorDe(dias[0]), ult=melhorDe(dias[dias.length-1]); const dif=pri.e?Math.round((ult.e/pri.e-1)*100):0; return {nome:(EX[id]||{}).nome||id,pri,ult,dif,n:dias.length}; }).sort((a,b)=>b.n-a.n);
  if(linhas.length){ L.push(""); L.push(`*Cargas (melhor série do dia, primeira → última):*`); linhas.slice(0,14).forEach(x=>L.push(`• ${x.nome}: ${x.pri.peso} kg × ${x.pri.reps}${x.n>1?` → ${x.ult.peso} kg × ${x.ult.reps} (${x.dif>0?"+":""}${x.dif}% força estimada)`:""}`)); }
  const esf=logs.map(l=>l.esforco).filter(Boolean); if(esf.length) L.push(`*Intensidade média percebida:* ${["","baixa","média","alta"][Math.round(esf.reduce((a,x)=>a+x,0)/esf.length)]}`);
  const ps=(S.pesagens||[]).filter(x=>x.data>=ini).sort((a,b)=>a.data.localeCompare(b.data)); if(ps.length>=2) L.push(`*Peso:* ${String(ps[0].peso).replace('.',',')} → ${String(ps[ps.length-1].peso).replace('.',',')} kg`); else if(ps.length) L.push(`*Peso:* ${String(ps[0].peso).replace('.',',')} kg`);
  const ck=(S.checkins||[]).filter(c=>c.data>=ini); const sono=ck.map(c=>c.sono).filter(x=>x!=null); if(sono.length) L.push(`*Sono médio:* ${(Math.round(sono.reduce((a,x)=>a+x,0)/sono.length*10)/10).toString().replace('.',',')} h`);
  const dores=new Set(); [...logs,...S.bjj.filter(b=>b.data>=ini)].forEach(x=>{ Object.entries(x.dores||{}).forEach(([k,v])=>{ if(v>=3) dores.add(((window.DORES||[]).find(d=>d[0]===k)||[k,k])[1]); }); if((x.dorCot||0)>=3) dores.add("Cotovelo"); if((x.dorJo||0)>=3) dores.add("Joelho"); }); Object.entries(S.perfil.dores||{}).forEach(([k,v])=>{ if(v) dores.add(((window.DORES||[]).find(d=>d[0]===k)||[k,k])[1]); });
  if(dores.size) L.push(`*Dor/limitação marcada:* ${[...dores].join(", ")}`);
  const pulos=logs.flatMap(l=>(l.puladas||[])); if(pulos.length) L.push(`*Exercícios pulados:* ${pulos.length}`);
  const al=window.alvos?alvos():null; if(al&&al.k) L.push(`*Nutrição:* meta ${al.k} kcal · ${al.p||"—"} g proteína`);
  L.push(""); L.push(`_Registro feito no DOSE. A ficha é do personal; o app só registra e organiza._`); return L.join("\n"); };
V.relpersonal=(p)=>{ setTitle("Relatório"); const d=+(p.d||14); const txt=relatorioPersonal(d);
  return `<button class="btn sm ghost" onclick="go('treino')">‹ Treino</button><h1>Relatório para o personal</h1><p class="small">Mande para quem montou sua ficha: constância, cargas, peso, sono e dores, sem planilha.</p>
   <div class="seg">${[[7,"7 dias"],[14,"14 dias"],[30,"30 dias"]].map(([k,n])=>`<button class="${d===k?'on':''}" onclick="go('relpersonal',{d:${k}})">${n}</button>`).join("")}</div>
   <pre class="card" style="white-space:pre-wrap;font-family:var(--num);font-size:13px;line-height:1.5">${esc(txt)}</pre>
   <div class="grid2"><button class="btn em" onclick="relEnviar(${d})">${I("share")} Enviar</button><button class="btn sec" onclick="navigator.clipboard.writeText(relatorioPersonal(${d})).then(()=>toast('Copiado'))">Copiar</button></div>`; };
window.relEnviar=async(d)=>{ const t=relatorioPersonal(d); try{ if(navigator.share) await navigator.share({title:"DOSE · relatório",text:t}); else { await navigator.clipboard.writeText(t); toast("Copiado: cole no WhatsApp"); } }catch(e){} };

// ---------- Tela Treino: card do personal no lugar de ênfase/prioridade ----------
window.cardPersonal=()=>{ const c=S.custom||{}; return `<div class="card" style="margin-top:14px;border-color:var(--ember)"><div class="eyebrow">Ficha do personal</div><b style="display:block;margin-top:4px">${esc(c.origem||"Seu personal")}</b>
  <p class="small" style="margin-top:6px">A DOSE não muda exercícios, séries ou repetições. Cuida do resto: sessão guiada, timer, carga da última vez, sugestão de progressão, dose do dia, nutrição e peso.</p><p class="serif coach" style="margin:8px 0 0">Seu personal monta. <i>A DOSE mostra para ele o que aconteceu.</i></p>
  <div class="grid2" style="margin-top:8px"><button class="btn em sm" onclick="go('relpersonal')">${I("share")} Relatório</button><button class="btn sec sm" onclick="go('importar')">${I("edit")} Importar de novo</button></div>
  <button class="btn ghost sm" style="margin-top:6px" onclick="go('ficha')">Editar exercício por exercício</button></div>`; };
})();

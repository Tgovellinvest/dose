// ================= DOSE · v7.5 — Minha dieta (aprovado pelo Tiago em 09/11/2026) =================
// Alternativa extra ao diário: a pessoa importa a dieta do nutricionista (texto colado ou PDF, lido no próprio aparelho),
// revisa as refeições e, no dia, só marca o check em cada refeição feita. A DOSE não passa dieta, só organiza a sua.
// Com a dieta ativa, o pilar Nutrição do medidor conta refeições cumpridas em vez de calorias. Sem dieta, nada muda.
(function(){
const V=window.VIEWS, A=window.AFTER;
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const CABEC=/^(caf[eé]( da manh[ãa])?|desjejum|cola[cç][aã]o|lanche( da manh[ãa]| da tarde)?|almo[cç]o|jantar|ceia|pr[eé][- ]?treino|p[oó]s[- ]?treino|refei[cç][aã]o\s*\d*)(?=$|[\s:\-–—(.,])/i;
const HORA=/^\(?\d{1,2}(:|h)\d{0,2}\)?\s*[-–—:·]?\s*/;
const uidD=()=>Math.random().toString(36).slice(2,9);
const D=()=>S.dieta||null;
const checks=d=>((S.dietaChecks||{})[d]||[]);

// ---------- leitura do texto ----------
function parse(txt){
  const linhas=String(txt||'').replace(/\r/g,'').split('\n').map(l=>l.replace(/\s+/g,' ').trim()).filter(Boolean);
  const refs=[]; let cur=null;
  for(let l of linhas){ const semHora=l.replace(HORA,''); const hora=(l.match(/^\(?(\d{1,2}(?::|h)\d{0,2})/)||l.match(/(\d{1,2}(?::|h)\d{2})\)?\s*$/)||[])[1]||'';
    const ehCab=CABEC.test(semHora)&&semHora.length<60 || (/:$/.test(l)&&l.length<50);
    if(ehCab){ cur={id:uidD(),nome:semHora.replace(/\s*[-–—(]?\s*\d{1,2}(?::|h)\d{2}\)?\s*$/,'').replace(/[:\-–—]+\s*$/,'').replace(/^\w/,c=>c.toUpperCase()),hora:hora.replace('h',':'),itens:[]}; refs.push(cur); const resto=semHora.replace(CABEC,'').replace(/\s*[-–—(]?\s*\d{1,2}(?::|h)\d{2}\)?\s*$/,'').replace(/^[\s:\-–—]+/,''); if(resto&&!/:$/.test(l)&&resto.length>2&&CABEC.test(semHora)) cur.itens.push(resto); continue; }
    const item=l.replace(/^[•\-\*·–—]+\s*/,'').replace(/^\d+[\.\)]\s+/,''); if(!item) continue;
    if(!cur){ cur={id:uidD(),nome:'Refeição 1',hora:'',itens:[]}; refs.push(cur); }
    cur.itens.push(item); }
  return refs.filter(r=>r.itens.length||r.nome);
}

// ---------- PDF (lido no aparelho, biblioteca carregada só quando precisa) ----------
let pdfLib=null;
function carregaPdf(){ if(pdfLib) return pdfLib; pdfLib=new Promise((ok,erro)=>{ const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  s.onload=()=>{ try{ window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; ok(window.pdfjsLib); }catch(e){ erro(e); } }; s.onerror=()=>{ pdfLib=null; erro(new Error('sem internet')); }; document.head.appendChild(s); }); return pdfLib; }
async function textoDoPdf(file){ const lib=await carregaPdf(); const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise; let out='';
  for(let i=1;i<=doc.numPages;i++){ const pg=await doc.getPage(i); const tc=await pg.getTextContent(); let y=null, linha='';
    tc.items.forEach(it=>{ const yy=Math.round(it.transform[5]); if(y!==null&&Math.abs(yy-y)>3){ out+=linha.trim()+'\n'; linha=''; } y=yy; linha+=it.str+(it.hasEOL?'\n':' '); }); out+=linha.trim()+'\n'; }
  return out; }
window.dtPdf=async(inp)=>{ const f=inp.files&&inp.files[0]; if(!f) return; const ta=document.getElementById('dtTexto'); ta.value='Lendo o PDF…';
  try{ ta.value=(await textoDoPdf(f)).trim(); if(!ta.value) { ta.value=''; toast('Esse PDF é uma imagem. Cole o texto da dieta.'); } }catch(e){ ta.value=''; toast('Não consegui ler o PDF. Cole o texto da dieta.'); } };

// ---------- telas ----------
V._dietaImportar=()=>`<h2>Importar minha dieta</h2>
  <p class="small">Cole o texto da dieta que o seu nutricionista passou, ou escolha o PDF. Tudo é lido aqui no aparelho. Depois você revisa as refeições.</p>
  <label>Texto da dieta</label><textarea id="dtTexto" rows="9" placeholder="Café da manhã&#10;2 ovos mexidos&#10;1 fatia de pão integral&#10;&#10;Almoço&#10;120 g de frango&#10;4 colheres de arroz"></textarea>
  <label style="margin-top:8px">Ou o PDF</label><input type="file" accept="application/pdf" onchange="dtPdf(this)">
  <button class="btn em" style="margin-top:12px" onclick="dtLer()">Separar refeições</button>
  <p class="tiny" style="margin-top:8px">A DOSE não passa dieta. Só organiza a sua para você marcar o que fez.</p>`;
window.dtLer=()=>{ const t=(document.getElementById('dtTexto')||{}).value||''; const refs=parse(t); if(!refs.length) return toast('Não achei refeições. Escreva o nome de cada refeição numa linha.'); window._dtRasc=refs; sheet(V._dietaRevisar()); };
V._dietaRevisar=()=>{ const r=window._dtRasc||[]; return `<h2>Revise as refeições</h2><p class="small">${r.length} ${r.length===1?'refeição':'refeições'}. Ajuste o nome, a hora e os itens, um por linha.</p>
  ${r.map((x,i)=>`<div class="card sub" style="margin-top:10px"><div class="grid2"><div><label>Refeição</label><input id="dtN${i}" value="${esc(x.nome)}"></div><div><label>Hora (opcional)</label><input id="dtH${i}" value="${esc(x.hora||'')}" placeholder="07:30"></div></div><label>Itens</label><textarea id="dtI${i}" rows="${Math.min(8,Math.max(2,x.itens.length))}">${esc(x.itens.join('\n'))}</textarea><button class="btn sm ghost" style="width:auto;margin-top:6px" onclick="dtTira(${i})">Tirar esta refeição</button></div>`).join('')}
  <div class="grid2" style="margin-top:12px"><button class="btn sec" onclick="dtMais()">Mais uma refeição</button><button class="btn em" onclick="dtSalvar()">Salvar dieta</button></div>`; };
const lerForm=()=>{ (window._dtRasc||[]).forEach((x,i)=>{ const g=id=>(document.getElementById(id)||{}).value; if(g('dtN'+i)!=null){ x.nome=g('dtN'+i).trim()||x.nome; x.hora=(g('dtH'+i)||'').trim(); x.itens=(g('dtI'+i)||'').split('\n').map(s=>s.trim()).filter(Boolean); } }); };
window.dtTira=i=>{ lerForm(); window._dtRasc.splice(i,1); sheet(V._dietaRevisar()); };
window.dtMais=()=>{ lerForm(); window._dtRasc.push({id:uidD(),nome:'Refeição '+(window._dtRasc.length+1),hora:'',itens:[]}); sheet(V._dietaRevisar()); };
window.dtSalvar=()=>{ lerForm(); const refs=(window._dtRasc||[]).filter(x=>x.nome); if(!refs.length) return toast('A dieta precisa de pelo menos uma refeição.');
  S.dieta={ativa:true,desde:today(),refeicoes:refs}; S.dietaChecks=S.dietaChecks||{}; save(); window._dtRasc=null; closeSheet(); toast('Dieta salva'); go('nutricao',{t:'dieta'}); };
window.dtEditar=()=>{ window._dtRasc=JSON.parse(JSON.stringify(D().refeicoes)); sheet(V._dietaRevisar()); };
window.dtAtiva=(on)=>{ if(!D()) return; D().ativa=!!on; save(); route(); toast(on?'Dieta ativa no medidor':'Dieta pausada. O medidor volta a contar calorias.'); };
window.dtApagar=()=>sheet(`<h3>Apagar a dieta?</h3><p class="small">Os checks já marcados também somem. Não dá para desfazer.</p><div class="grid2"><button class="btn sec" onclick="closeSheet()">Manter</button><button class="btn danger" onclick="S.dieta=null;S.dietaChecks={};save();closeSheet();route();toast('Dieta apagada')">Apagar</button></div>`);
window.dtCheck=(btn,d,id)=>{ S.dietaChecks=S.dietaChecks||{}; const l=new Set(checks(d)); const on=!l.has(id); on?l.add(id):l.delete(id); S.dietaChecks[d]=[...l]; save();
  btn.classList.toggle('done',on); btn.closest('.dt-ref')&&btn.closest('.dt-ref').classList.toggle('feita',on);
  if(on&&!reduz()){ btn.classList.remove('m3-conf'); void btn.offsetWidth; btn.classList.add('m3-conf'); setTimeout(()=>btn.classList.remove('m3-conf'),420); try{ navigator.vibrate&&navigator.vibrate(12); }catch(e){} }
  const tot=document.getElementById('dtTot'); if(tot){ const n=D().refeicoes.length, f=checks(d).filter(x=>D().refeicoes.some(r=>r.id===x)).length; tot.textContent=`${f} de ${n}`; } };

function listaDia(d,compacto){ const dt=D(); if(!dt) return ''; const ck=checks(d); const n=dt.refeicoes.length, f=ck.filter(x=>dt.refeicoes.some(r=>r.id===x)).length;
  return `<div class="card dt-card"><div class="row" style="justify-content:space-between;align-items:baseline"><div><div class="eyebrow" style="text-align:left">Minha dieta · ${d===today()?'hoje':fmtDL(d)}</div></div><b class="num" id="dtTot">${f} de ${n}</b></div>
   ${dt.refeicoes.map(r=>{ const on=ck.includes(r.id); return `<div class="set-row dt-ref ${on?'feita':''}"><button class="ck ${on?'done':''}" aria-label="Fiz ${esc(r.nome)}" onclick="dtCheck(this,'${d}','${r.id}')">${I('check')}</button><div class="dt-t"><b>${esc(r.nome)}${r.hora?` <span class="num">${esc(r.hora)}</span>`:''}</b>${compacto?'':`<span>${r.itens.map(esc).join(' · ')}</span>`}</div></div>`; }).join('')}
   ${dt.ativa?'':'<p class="tiny" style="margin-top:6px">Dieta pausada no medidor.</p>'}</div>`; }

// ---------- aba Nutrição ----------
const _n=V.nutricao; V.nutricao=(p)=>{ const tab=(p&&p.t)||'hoje'; let h=_n(tab==='dieta'?Object.assign({},p,{t:'hoje'}):p);
  h=h.replace(/(<div class="seg">[\s\S]*?)(<\/div>)/,(m,a,b)=>a.replace('<button class="on"','<button class="'+(tab==='dieta'?'':'on')+'"').replace(/class="on"/g,tab==='dieta'?'class=""':'class="on"')+`<button class="${tab==='dieta'?'on':''}" onclick="go('nutricao',{t:'dieta'})">Dieta</button>`+b);
  if(tab==='dieta'){ const seg=(h.match(/<div class="seg">[\s\S]*?<\/div>/)||[''])[0]; setTitle('Nutrição');
    if(!D()) return `<h1 class="sec">Minha dieta</h1>${seg}<p class="serif" style="margin-top:14px">Sua dieta, do seu nutricionista. <i>A DOSE só organiza.</i></p><p class="small">Importe a dieta uma vez. No dia a dia, é só marcar cada refeição feita, sem pesar nem buscar alimento.</p><button class="btn em" style="margin-top:10px" onclick="sheet(V._dietaImportar())">Importar minha dieta</button><p class="tiny" style="margin-top:10px">O diário com calorias continua disponível na aba Diário.</p>`;
    const d=(p&&p.d)||today();
    return `<h1 class="sec">Minha dieta</h1>${seg}${listaDia(d,false)}
      <div class="grid2" style="margin-top:10px"><button class="btn sec" onclick="dtEditar()">Editar dieta</button><button class="btn ghost" onclick="dtAtiva(${!D().ativa})">${D().ativa?'Pausar no medidor':'Ativar no medidor'}</button></div>
      <button class="btn sm ghost" style="width:auto;margin-top:10px" onclick="sheet(V._dietaImportar())">Importar outra dieta</button> <button class="btn sm ghost" style="width:auto;margin-top:10px" onclick="dtApagar()">Apagar</button>
      <p class="tiny" style="margin-top:10px">Com a dieta ativa, o pilar Nutrição do "Você está na dose?" conta as refeições feitas na semana.</p>`; }
  if(tab==='hoje'&&D()&&D().ativa){ const d=(p&&p.d)||today(); h=h.replace('<div class="card hero">',listaDia(d,true)+'<div class="card hero">'); }
  return h; };

// ---------- pilar Nutrição pela dieta ----------
const DIASEM=["seg","ter","qua","qui","sex","sab","dom"], DN={seg:"S",ter:"T",qua:"Q",qui:"Q",sex:"S",sab:"S",dom:"D"};
function pilarDieta(){ const dt=D(); const n=dt.refeicoes.length; const hoje=today(); const si=semanaIni();
  let feitas=0, esperadas=0; const dias=DIASEM.map((dd,ix)=>{ const x=new Date(si+'T12:00:00'); x.setDate(x.getDate()+ix); const data=x.ymd(); const f=checks(data).filter(id=>dt.refeicoes.some(r=>r.id===id)).length;
    if(data>=dt.desde&&(data<hoje||(data===hoje&&f>0))){ feitas+=f; esperadas+=data===hoje?f:n; }
    return {l:DN[dd],h:data<=hoje&&n?Math.max(0.06,f/n):0.06,c:f?(f>=n?'var(--bone)':'var(--tx3)'):'var(--s3)',hoje:data===hoje}; });
  const pct=esperadas?feitas/esperadas:null;
  const leitura=!esperadas?'Marque as refeições da dieta ao longo do dia. Uma já conta.':`${feitas} de ${esperadas} refeições da dieta feitas nesta semana.`;
  return {k:'nutri',nome:'Nutrição',pct,semDado:!esperadas,valor:esperadas?`${feitas} de ${esperadas}`:'—',leitura,dias,ir:"go('nutricao',{t:'dieta'})",irTxt:'Abrir minha dieta'}; }
const _nd=window.naDose; if(_nd) window.naDose=()=>{ const r=_nd(); if(!D()||!D().ativa) return r;
  try{ const i=r.pilares.findIndex(p=>p.k==='nutri'); if(i<0) return r; r.pilares[i]=pilarDieta();
    const av=r.pilares.filter(p=>p.pct!=null); const score=av.length?Math.round(av.reduce((a,p)=>a+p.pct,0)/av.length*100):null;
    r.score=score; r.estado=score==null?'A semana começa agora':score>=80?'Na dose':score>=55?'Quase na dose':'Abaixo da dose'; r.cor=score==null?'var(--tx2)':score>=80?'var(--ok)':score>=55?'var(--warn)':'var(--tx2)';
    if(r.frase&&/comida|comeu/.test((r.frase.i||'')+(r.frase.sub||''))){ r.frase.i=r.frase.i.replace(/registre o que comeu para medir a comida/,'marque as refeições da dieta'); r.frase.sub=(r.frase.sub||'').replace(/registre o que comeu hoje/,'marque as refeições da dieta'); }
  }catch(e){} return r; };
})();

// ================= DOSE · Leitor de código de barras =================
// Fluxo: câmera → código (EAN/UPC) → 1) Meus alimentos 2) índice offline (Open Food Facts BR) 3) API Open Food Facts → confirmar porção → diário.
// Não achou: o usuário digita o rótulo uma vez e o produto fica salvo com o código (funciona offline depois).
// Leitura: BarcodeDetector nativo quando existe (Android/Chrome); senão ZXing (MIT), carregado só ao abrir o leitor.
(function(){
const V=window.VIEWS;
const loadScript=src=>new Promise((ok,er)=>{ if(document.querySelector(`script[data-src="${src}"]`)) return ok(); const s=document.createElement('script'); s.src=src; s.dataset.src=src; s.onload=ok; s.onerror=()=>er(new Error("Sem conexão para carregar "+src)); document.head.appendChild(s); });
const r1=x=>Math.round((+x||0)*10)/10;
// ---------- Meus alimentos (salvos com código) ----------
const meus=()=>S.meusAlimentos||(S.meusAlimentos=[]);
function injetarMeus(){ (S.meusAlimentos||[]).forEach(f=>{ if(!window.FOODS.some(x=>x.n===f.n)) window.FOODS.unshift(Object.assign({cat:"Meus alimentos"},f)); }); window.FOOD_CATS=[...new Set(window.FOODS.map(f=>f.cat))]; }
window.addEventListener('load',()=>setTimeout(injetarMeus,0)); try{ injetarMeus(); }catch(e){}
function guardar(f){ const L=meus(); const i=L.findIndex(x=>(f.code&&x.code===f.code)||x.n===f.n); const o={n:f.n,u:f.u,k:f.k,p:f.p,c:f.c,g:f.g,code:f.code||null,fonte:f.fonte||"",cat:"Meus alimentos"}; if(i>=0) L[i]=o; else L.unshift(o); const j=window.FOODS.findIndex(x=>x.n===o.n); if(j>=0) window.FOODS[j]=o; else window.FOODS.unshift(o); window.FOOD_CATS=[...new Set(window.FOODS.map(f=>f.cat))]; save(); }
// ---------- Porção ----------
function porcao(nome,qtd,servG){ const nl=nome.toLowerCase(); const m=String(qtd||"").match(/(\d+(?:[.,]\d+)?)\s*(g|ml|kg|l)\b/i); let pq=null,un='g'; if(m){ pq=parseFloat(m[1].replace(',','.')); un=m[2].toLowerCase(); if(un==='kg'){pq*=1000;un='g';} if(un==='l'){pq*=1000;un='ml';} }
  // refeição pronta / marmita / lata / garrafinha: a embalagem é a porção
  if(pq&&pq<=600&&/marmita|pronto|prato|liv ?up|risoto|escondidinho|estrogonofe|strogonoff|lasanha|frango|carne|filé|file|sopa|caldo|bowl|salada|yakisoba|nhoque|massa ao|feijoada|monster|energ|lata|refrigerante|suco|iogurte|bebida|shake|barra|whey pronto|yopro/.test(nl)) return {u:`1 embalagem (${Math.round(pq)} ${un})`,q:pq};
  if(servG&&servG>=5&&servG<=600) return {u:`1 porção (${Math.round(servG)} ${/bebida|suco|leite|refrigerante|água|agua|chá|cha\b/.test(nl)?'ml':'g'})`,q:servG};
  if(/liv ?up|marmita|pronto|prato|risot|escondidinho|estrogonofe|strogonoff|lasanha|nhoque|bowl|sopa|caldo|,| com | e (arroz|feijão|purê|batata|legumes)/.test(nl)&&!/biscoito|chocolate|bolacha|cookie|barra|cereal|granola/.test(nl)) return {u:'100 g',q:100};
  if(/refrigerante|coca|pepsi|guaran|fanta|sprite|sukita|suco|néctar|nectar|bebida|^leite (uht|integral|desnatado|semi|zero)|^leite$|água|agua|chá|cha\b|energ|isotôn|isoton|gatorade|powerade|kombucha|tônica|tonica|cerveja/.test(nl)&&!/em pó|em po|condensado|pó\b/.test(nl)) return {u:'200 ml',q:200};
  const T=[[/leite condensado|doce de leite|creme de avelã|nutella|geleia|\bmel\b|pasta de amendoim/,20],[/chocolate|bombom|bis\b|kit ?kat|talento|baton/,25],[/biscoito|bolacha|cookie|wafer|torrada|cracker/,30],[/salgadinho|chips|batata palha|pipoca|amendoim/,25],[/requeij|cream cheese|queijo|ricota/,30],[/manteiga|margarina/,10],[/achocolatado|nescau|toddy|leite em pó|leite em po/,20],[/whey|proteína em pó|proteina em po/,30],[/granola|cereal|aveia/,30],[/pão|pao|bisnag/,50],[/presunto|peito de peru|mortadela|salame/,40],[/arroz/,50],[/feij|lentilha|grão|grao/,30],[/macarr|espaguete|massa|penne/,80],[/maionese|ketchup|mostarda/,12],[/azeite|óleo|oleo/,13],[/iogurte/,100],[/sorvete|picolé/,60]];
  for(const [rx,g] of T) if(rx.test(nl)) return {u:`${g} g`,q:g};
  return {u:'100 g',q:100}; }
function montar(nome,marca,qtd,k100,p100,c100,g100,servG,fonte,code){ let n=(nome||"Produto").trim(); n=n.charAt(0).toUpperCase()+n.slice(1); const mb=(marca||"").split(',')[0].trim(); if(mb&&!n.toLowerCase().includes(mb.toLowerCase())) n+=` (${mb})`;
  const po=porcao(n,qtd,servG); const m=po.q/100; const k=Math.round(k100*m);
  const est=4*p100+4*c100+9*g100; const coerente=!(k100>40&&Math.abs(est-k100)/k100>0.3);
  return {n,u:po.u,k,p:r1(p100*m),c:r1(c100*m),g:r1(g100*m),code,fonte,coerente,k100}; }
// ---------- Busca do código ----------
async function buscar(code){ code=String(code).replace(/\D/g,''); if(code.length<8) return null;
  const v=[code,code.replace(/^0+/,''),code.padStart(13,'0')];
  const m=meus().find(x=>x.code&&v.includes(x.code)); if(m) return Object.assign({fonte:"Meus alimentos",coerente:true},m);
  try{ await loadScript('data/barcodes.js?v=4.8.1'); }catch(e){}
  const B=window.BARCODES||{}; const hit=v.map(c=>B[c]).find(Boolean); if(hit){ const [n,b,q,k,p,c,g]=hit; return montar(n,b,q,k,p,c,g,null,"Open Food Facts (índice do DOSE)",code); }
  if(!navigator.onLine) return {offline:true};
  for(const host of ['https://world.openfoodfacts.org','https://br.openfoodfacts.org']){ try{ const ctl=new AbortController(); const t=setTimeout(()=>ctl.abort(),7000);
      const r=await fetch(`${host}/api/v2/product/${code}.json?fields=product_name,product_name_pt,brands,quantity,serving_quantity,nutriments`,{signal:ctl.signal}); clearTimeout(t); if(!r.ok) continue; const j=await r.json(); if(j.status!==1||!j.product) return null;
      const P=j.product, N=P.nutriments||{}; const k=N['energy-kcal_100g']??(N.energy_100g?N.energy_100g/4.184:null); if(k==null) return {semTabela:true,nome:P.product_name_pt||P.product_name,marca:P.brands};
      return montar(P.product_name_pt||P.product_name,P.brands,P.quantity,+k,+N.proteins_100g||0,+N.carbohydrates_100g||0,+N.fat_100g||0,+P.serving_quantity||null,"Open Food Facts",code); }catch(e){} }
  return {erroRede:true}; }
// ---------- Câmera ----------
let stream=null, leitor=null, parar=false, raf=0;
function fecharCam(){ parar=true; cancelAnimationFrame(raf); try{ leitor&&leitor.reset&&leitor.reset(); }catch(e){} leitor=null; if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; } const vd=document.getElementById('scVid'); if(vd) vd.srcObject=null; }
const _close=window.closeSheet; window.closeSheet=function(){ fecharCam(); return _close.apply(this,arguments); };
window.scanAbrir=(d)=>{ window._scD=d||(R.p.d)||today(); sheet(`<h2>Escanear</h2>
  <div class="scan"><video id="scVid" playsinline muted autoplay></video><div class="mira"><i></i></div><div class="scMsg" id="scMsg">Abrindo a câmera…</div></div>
  <div class="grid2" style="margin-top:10px"><label class="btn sec" style="margin:0;text-align:center">${I("camera",18)} Foto do código<input type="file" accept="image/*" capture="environment" style="display:none" onchange="scFoto(this)"></label><button class="btn ghost" onclick="scDigitar()">Digitar número</button></div>
  <button class="btn ghost sm" style="margin-top:8px" onclick="fecharCamESair()">‹ Voltar à busca</button>
  <p class="tiny" style="margin-top:8px">Aponte para o código de barras (EAN) da embalagem. Os dados vêm do Open Food Facts, base aberta de rótulos; confira com a embalagem.</p>`);
  iniciar(); };
window.fecharCamESair=()=>{ fecharCam(); sheet(V._addFood(window._scD)); };
const msg=t=>{ const e=document.getElementById('scMsg'); if(e) e.textContent=t; };
async function iniciar(){ parar=false; const vd=document.getElementById('scVid'); if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ msg("Câmera indisponível aqui. Use Foto do código ou Digitar número."); return; }
  try{ stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false}); }
  catch(e){ msg(e.name==='NotAllowedError'?"Sem permissão de câmera. No iPhone: Ajustes › Safari › Câmera › Permitir (ou use Foto do código).":"Não abriu a câmera. Use Foto do código ou Digitar número."); return; }
  if(parar){ fecharCam(); return; } vd.srcObject=stream; try{ await vd.play(); }catch(e){} msg("Procurando código…");
  if('BarcodeDetector' in window){ try{ const fm=await BarcodeDetector.getSupportedFormats(); if(fm.includes('ean_13')){ const det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128'].filter(x=>fm.includes(x))});
        const loop=async()=>{ if(parar) return; try{ const r=await det.detect(vd); if(r&&r[0]&&r[0].rawValue){ achou(r[0].rawValue); return; } }catch(e){} raf=requestAnimationFrame(loop); }; loop(); return; } }catch(e){} }
  try{ await loadScript('data/zxing.min.js'); }catch(e){ msg("Sem conexão para o leitor. Use Digitar número."); return; }
  const Z=window.ZXing; const hints=new Map(); hints.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.EAN_13,Z.BarcodeFormat.EAN_8,Z.BarcodeFormat.UPC_A,Z.BarcodeFormat.UPC_E,Z.BarcodeFormat.CODE_128]); hints.set(Z.DecodeHintType.TRY_HARDER,true);
  const mfr=new Z.MultiFormatReader(); mfr.setHints(hints); const cv=document.createElement('canvas'); const cx=cv.getContext('2d',{willReadFrequently:true}); let ultimo=0;
  const loop=(ts)=>{ if(parar) return; if(ts-ultimo>180&&vd.videoWidth){ ultimo=ts; const w=vd.videoWidth, h=vd.videoHeight; window._scT=(window._scT||0)+1; const full=window._scT%2===0; const cw=full?w:Math.round(w*0.9), ch=full?h:Math.round(h*0.5); cv.width=cw; cv.height=ch; cx.drawImage(vd,(w-cw)/2,(h-ch)/2,cw,ch,0,0,cw,ch);
      try{ const lum=new Z.HTMLCanvasElementLuminanceSource(cv); const bmp=new Z.BinaryBitmap(new Z.HybridBinarizer(lum)); const r=mfr.decode(bmp); if(r&&r.getText()){ achou(r.getText()); return; } }catch(e){} }
    raf=requestAnimationFrame(loop); }; raf=requestAnimationFrame(loop); }
window.scFoto=async(inp)=>{ const f=inp.files&&inp.files[0]; if(!f) return; msg("Lendo a foto…"); try{ await loadScript('data/zxing.min.js'); }catch(e){ return msg("Sem conexão para o leitor. Use Digitar número."); }
  const Z=window.ZXing; const img=new Image(); img.onload=()=>{ const cv=document.createElement('canvas'); const sc=Math.min(1,1600/Math.max(img.width,img.height)); cv.width=img.width*sc; cv.height=img.height*sc; cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
    const hints=new Map(); hints.set(Z.DecodeHintType.TRY_HARDER,true); hints.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.EAN_13,Z.BarcodeFormat.EAN_8,Z.BarcodeFormat.UPC_A,Z.BarcodeFormat.UPC_E,Z.BarcodeFormat.CODE_128]); const mfr=new Z.MultiFormatReader(); mfr.setHints(hints);
    try{ const r=mfr.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(cv)))); achou(r.getText()); }catch(e){ msg("Não achei o código na foto. Chegue mais perto, com luz, ou digite o número."); } URL.revokeObjectURL(img.src); };
  img.src=URL.createObjectURL(f); };
window.scDigitar=()=>{ fecharCam(); sheet(`<h2>Digitar código</h2><label>Número embaixo das barras</label><input id="scNum" inputmode="numeric" pattern="[0-9]*" maxlength="14" placeholder="Ex.: 7891000100103" style="letter-spacing:.08em"><div class="grid2" style="margin-top:12px"><button class="btn ghost" onclick="scanAbrir(window._scD)">‹ Câmera</button><button class="btn em" onclick="achou(document.getElementById('scNum').value)">Buscar</button></div>`); setTimeout(()=>{ const e=document.getElementById('scNum'); e&&e.focus(); },60); };
window.achou=async(code)=>{ code=String(code||"").replace(/\D/g,''); if(code.length<8) return toast("Código inválido"); fecharCam(); if(navigator.vibrate) navigator.vibrate(40);
  sheet(`<h2>Código ${esc(code)}</h2><div class="card sub small">Buscando o produto…</div>`); const r=await buscar(code); window._scCode=code;
  if(!r||r.semTabela||r.offline||r.erroRede){ const t=r&&r.offline?"Sem internet e o produto não está no índice offline.":r&&r.erroRede?"Não consegui consultar a base agora.":r&&r.semTabela?`Achei "${esc(r.nome||'')}", mas sem tabela nutricional na base.`:"Produto não encontrado na base aberta.";
    return sheet(`<h2>Cadastrar rótulo</h2><p class="small muted">${t} Digite a tabela da embalagem uma vez: o DOSE guarda com o código e, da próxima vez, é só escanear.</p>
      <label>Nome do produto</label><input id="scNome" value="${esc(r&&r.nome?r.nome:'')}" placeholder="Ex.: Liv Up frango com batata-doce">
      <div class="grid2"><div><label>Porção do rótulo</label><input id="scPq" type="number" inputmode="decimal" placeholder="g ou ml"></div><div><label>kcal na porção</label><input id="scK" type="number" inputmode="decimal"></div></div>
      <div class="grid3"><div><label>Proteína g</label><input id="scP" type="number" inputmode="decimal"></div><div><label>Carbo g</label><input id="scC" type="number" inputmode="decimal"></div><div><label>Gordura g</label><input id="scG" type="number" inputmode="decimal"></div></div>
      <div class="grid2" style="margin-top:12px"><button class="btn ghost" onclick="scanAbrir(window._scD)">‹ Escanear de novo</button><button class="btn em" onclick="scSalvarManual()">Salvar e adicionar</button></div><p class="tiny">Código ${esc(code)} · fica só no seu aparelho (e na sua conta, se sincronizar).</p>`); }
  window._scF=r; scConfirmar(r); };
function scConfirmar(f){ const b=(String(f.u).match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i)||[]); const bq=b[1]?parseFloat(b[1]):null, bu=b[2]||'g';
  sheet(`<h2>${esc(f.n)}</h2><p class="small muted">${esc(f.u)} = <b>${f.k} kcal</b> · P ${f.p} · C ${f.c} · G ${f.g}</p>
   ${f.coerente===false?`<div class="card sub small" style="border-color:var(--warn)">As calorias desse rótulo não batem com os macros (enviado pela comunidade). Confira na embalagem antes de confiar.</div>`:""}
   <div class="grid2"><div><label>Porções</label><input id="scM" type="number" step="0.25" min="0" value="1" inputmode="decimal" oninput="scSync('m')"></div>${bq?`<div><label>Ou em ${bu}</label><input id="scGr" type="number" step="5" min="0" value="${bq}" inputmode="decimal" oninput="scSync('g')"></div>`:""}</div>
   ${/^100 g$/.test(f.u)&&/marmita|pronto|prato|liv ?up|risot|escondidinho|estrogonofe|strogonoff|lasanha|frango|carne|filé|file|arroz|feij|sopa|caldo|bowl|nhoque|massa/i.test(f.n)?`<p class="tiny" style="color:var(--warn)">A base não informa o peso da embalagem. Digite os gramas que estão no rótulo (ex.: 300).</p>`:""}
   <p class="mono" id="scPrev" style="margin-top:8px">${f.k} kcal</p>
   <div class="grid2" style="margin-top:12px"><button class="btn ghost" onclick="scanAbrir(window._scD)">‹ Escanear outro</button><button class="btn em" onclick="scAdicionar()">Adicionar</button></div>
   <p class="tiny">Fonte: ${esc(f.fonte||"")} · código ${esc(f.code||window._scCode||"")}. Fica salvo em Meus alimentos.</p>`); window._scBase={q:bq,u:bu}; }
window.scSync=(o)=>{ const f=window._scF, bs=window._scBase; const mi=document.getElementById('scM'), gi=document.getElementById('scGr'); if(o==='g'&&gi&&bs.q) mi.value=+(num(gi.value)/bs.q).toFixed(2); else if(gi&&bs.q) gi.value=Math.round(num(mi.value)*bs.q); const m=num(mi.value)||0; document.getElementById('scPrev').textContent=`${Math.round(f.k*m)} kcal · P ${Math.round(f.p*m)} · C ${Math.round(f.c*m)} · G ${Math.round(f.g*m)}`; };
window.scAdicionar=()=>{ const f=window._scF; const m=num(document.getElementById('scM').value)||1; const bs=window._scBase; const d=window._scD||today();
  guardar(f); S.diario.push({id:uid(),data:d,per:S._per||"almoco",nome:f.n,qtd:bs.q&&m!==1?`${Math.round(m*bs.q)} ${bs.u}`:`${m}× ${f.u}`,k:f.k*m,p:f.p*m,c:f.c*m,g:f.g*m,code:f.code||null}); save();
  window._fdAdd=[...(window._fdAdd||[]),f.n]; go('nutricao',{d}); if(window.fdReabrir) fdReabrir(d); else closeSheet(); };
window.scSalvarManual=()=>{ const nome=(document.getElementById('scNome').value||"").trim(); const pq=num(scPq.value), k=num(scK.value); if(!nome||!k) return toast("Nome e kcal são obrigatórios");
  const un=/bebida|suco|leite|refrigerante|água|agua|chá|cha\b|energ/i.test(nome)?'ml':'g'; const f={n:nome,u:pq?`1 porção (${pq} ${un})`:'1 porção',k:Math.round(k),p:r1(num(scP.value)),c:r1(num(scC.value)),g:r1(num(scG.value)),code:window._scCode,fonte:"você (rótulo)",coerente:true};
  window._scF=f; window._scBase={q:pq||null,u:un}; const el=document.createElement('input'); el.id='scM'; el.value='1'; el.type='hidden'; document.getElementById('sheetBody').appendChild(el); scAdicionar(); toast("Produto salvo com o código"); };
// Botão no topo da busca de alimentos
const _af=V._addFood; V._addFood=(d)=>{ const h=_af(d); return h.replace('<h2>Adicionar</h2>',`<div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0">Adicionar</h2><button class="btn sm em" style="width:auto;padding:8px 14px" onclick="scanAbrir('${d}')">${I("barcode",18)} Escanear</button></div>`); };
})();

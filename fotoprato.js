// Foto do prato (v8.20): a foto é só referência na tela; quem escolhe os alimentos e a porção é a pessoa.
// Os macros vêm sempre da base (TACO/USDA/rótulos), nunca de um modelo. A foto não é enviada nem guardada.
// A estimativa de porção sem pesar leva uma faixa de erro (±35%, o topo do erro de porção por foto); itens marcados "Pesei" não têm faixa.
(function(){
const norm=t=>String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const baseG=u=>{ const m=String(u).match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i); return m?{q:parseFloat(m[1].replace(',','.')),un:m[2].toLowerCase()}:null; };
const PERN={cafe:'Café da manhã',almoco:'Almoço',lanche:'Lanche',jantar:'Jantar',ceia:'Ceia'};
window.FP_ERRO=0.35;
const st=window._fp={d:null,itens:[],url:null};

// Conta pura (testável): kcal central, macros e faixa só sobre o que não foi pesado.
window.fpCalc=(itens,foods)=>{ const F=foods||window.FOODS; let k=0,p=0,c=0,g=0,inc=0;
  itens.forEach(i=>{ const f=F[i.i]; if(!f) return; const m=i.m; k+=f.k*m; p+=f.p*m; c+=f.c*m; g+=f.g*m; if(!i.pesei) inc+=f.k*m; });
  return {k,p,c,g,lo:k-window.FP_ERRO*inc,hi:k+window.FP_ERRO*inc,inc}; };

const soltaFoto=()=>{ if(st.url){ try{URL.revokeObjectURL(st.url);}catch(e){} st.url=null; } };
window.fpAbrir=(d)=>{ soltaFoto(); st.d=d; st.itens=[];
  sheet(`<h2>Foto do prato</h2>
  <p class="muted small">Tire a foto para ter o prato à vista enquanto monta a refeição. Você escolhe os alimentos e a porção; os números vêm da tabela. A foto não é enviada nem fica guardada.</p>
  <label class="btn em" style="margin-top:10px;display:block;text-align:center">Tirar a foto<input id="fpFile" type="file" accept="image/*" capture="environment" hidden onchange="fpFoto(this)"></label>
  <button class="btn ghost" style="margin-top:8px" onclick="fpPrato()">Montar sem foto</button>`); };
window.fpFoto=(inp)=>{ const f=inp.files&&inp.files[0]; if(f){ st.url=URL.createObjectURL(f); } inp.value=''; fpPrato(); };

const recentes=()=>{ const per=S._per||'almoco'; const cont={}; (S.diario||[]).forEach(x=>{ if((x.per||'almoco')===per) cont[x.nome]=(cont[x.nome]||0)+1; });
  return Object.keys(cont).sort((a,b)=>cont[b]-cont[a]).slice(0,8).map(n=>window.FOODS.findIndex(f=>f.n===n)).filter(i=>i>=0); };
const chip=i=>`<button class="chip" onclick="fpAdd(${i})">${esc(window.FOODS[i].n)}</button>`;
const fmt=n=>Math.round(n);

window.fpPrato=()=>{ const r=recentes();
  sheet(`<h2>Monte o prato</h2>
  ${st.url?`<img id="fpImg" src="${st.url}" alt="Foto do prato" style="width:100%;max-height:20dvh;object-fit:cover;border-radius:14px;margin-bottom:10px">`:''}
  <input id="fpQ" placeholder="Buscar alimento (ex.: arroz, frango)" oninput="fpBusca()" autocomplete="off">
  ${r.length?`<p class="tiny" style="margin:8px 0 4px">Mais comuns em ${esc(PERN[S._per||'almoco']||'esta refeição')} para você</p><div class="chips" style="flex-wrap:nowrap;overflow-x:auto">${r.map(chip).join('')}</div>`:''}
  <div id="fpRes" class="list" style="margin-top:6px"></div>
  <div id="fpPlate" style="margin-top:10px"></div>`); fpDesenha(); };
window.fpBusca=()=>{ const q=norm((document.getElementById('fpQ')||{}).value||''); const box=document.getElementById('fpRes'); if(!box) return;
  if(!q){ box.innerHTML=''; return; } const ws=q.split(/\s+/).filter(Boolean); const L=[];
  for(let i=0;i<window.FOODS.length&&L.length<10;i++){ const f=window.FOODS[i]; const n=f._n||(f._n=norm(f.n)); if(ws.every(w=>n.includes(w))) L.push(i); }
  box.innerHTML=L.length?L.map(i=>`<div class="item" onclick="fpAdd(${i})"><div class="t"><b>${esc(window.FOODS[i].n)}</b><span>${esc(window.FOODS[i].u)} · ${window.FOODS[i].k} kcal</span></div><span class="arrow">+</span></div>`).join(''):'<p class="muted small">Nada encontrado.</p>'; };
window.fpAdd=(i)=>{ if(!window.FOODS[i]) return; const ex=st.itens.find(x=>x.i===i); if(ex) ex.m+=0.5; else st.itens.push({i,m:1,pesei:false});
  const q=document.getElementById('fpQ'); if(q){ q.value=''; } const b=document.getElementById('fpRes'); if(b) b.innerHTML=''; fpDesenha(); };
window.fpPasso=(n,dv)=>{ const it=st.itens[n]; if(!it) return; it.m=Math.max(0,+(it.m+dv).toFixed(2)); if(it.m<=0) st.itens.splice(n,1); fpDesenha(); };
window.fpPesei=(n)=>{ const it=st.itens[n]; if(!it) return; it.pesei=!it.pesei; fpDesenha(); };
window.fpDesenha=()=>{ const box=document.getElementById('fpPlate'); if(!box) return;
  if(!st.itens.length){ box.innerHTML='<p class="muted small">Escolha os alimentos que estão no prato.</p>'; return; }
  const t=window.fpCalc(st.itens); const faixa=t.inc>0;
  box.innerHTML=st.itens.map((it,n)=>{ const f=window.FOODS[it.i]; const b=baseG(f.u); const qtd=b?`${fmt(it.m*b.q)} ${b.un}`:`${it.m}× ${esc(f.u)}`;
    return `<div class="card sub" style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><b>${esc(f.n)}</b><div class="tiny">${qtd} · ${fmt(f.k*it.m)} kcal</div></div>
    <div style="display:flex;align-items:center;gap:6px"><button class="btn sm ghost" style="width:auto;padding:6px 12px" aria-label="Menos" onclick="fpPasso(${n},-0.5)">−</button><span class="mono">${it.m}×</span><button class="btn sm ghost" style="width:auto;padding:6px 12px" aria-label="Mais" onclick="fpPasso(${n},0.5)">+</button></div></div>
    <label class="tiny" style="display:flex;gap:6px;align-items:center;margin-top:6px"><input type="checkbox" ${it.pesei?'checked':''} onchange="fpPesei(${n})"> Pesei esta porção</label></div>`; }).join('')+
  `<div class="card" style="margin-top:6px"><div class="mono" id="fpTot" style="font-size:1.2rem">${faixa?`${fmt(t.lo)} a ${fmt(t.hi)} kcal`:`${fmt(t.k)} kcal`}</div>
   <div class="tiny">${faixa?`Estimativa central ${fmt(t.k)} kcal. Sem pesar, a porção pode variar cerca de ${Math.round(window.FP_ERRO*100)}% para mais ou para menos, e o valor real ainda pode ficar fora da faixa.`:'Tudo pesado: sem faixa.'}</div>
   <div class="tiny" style="margin-top:4px">P ${fmt(t.p)} g · C ${fmt(t.c)} g · G ${fmt(t.g)} g (pela tabela, na porção central)</div></div>
   <div class="grid2" style="margin-top:12px"><button class="btn ghost" onclick="fpCancelar()">Cancelar</button><button class="btn em" onclick="fpSalvar()">Salvar em ${esc(PERN[S._per||'almoco']||'refeição')}</button></div>`; };
window.fpCancelar=()=>{ soltaFoto(); st.itens=[]; closeSheet(); };
window.fpSalvar=()=>{ if(!st.itens.length) return; const d=st.d||(window.R&&R.p&&R.p.d)||today();
  st.itens.forEach(it=>{ const f=window.FOODS[it.i]; const b=baseG(f.u); const m=it.m;
    S.diario.push({id:uid(),data:d,per:S._per||'almoco',nome:f.n,qtd:b?`${fmt(m*b.q)} ${b.un}`:`${m}× ${f.u}`,k:f.k*m,p:f.p*m,c:f.c*m,g:f.g*m,est:!it.pesei}); });
  save(); const n=st.itens.length; soltaFoto(); st.itens=[]; closeSheet(); go('nutricao',{d}); toast(`Refeição salva (${n} ${n===1?'item':'itens'})`); };
window.addEventListener('pagehide',soltaFoto);

// Botão ao lado de "Escanear" na tela Adicionar
const _af=V._addFood; V._addFood=(d)=>{ const h=_af(d); return h.replace(/(Escanear<\/button>)/,`$1<button class="btn sm ghost" style="width:auto;padding:8px 14px;margin-left:6px" onclick="fpAbrir('${d}')">Foto do prato</button>`); };

(window.SCIENCE||[]).push({t:"Estimar porção por foto tem erro: o DOSE mostra faixa",cat:"Nutrição",oque:"Uma foto 2D não traz profundidade nem densidade; o volume de uma porção estimado por foto erra, em média, de 25% a 35% em dados não vistos, e um estudo com refeições pesadas em laboratório achou erro diário individual de cerca de 25% ou mais, com subestimação de proteína.",regra:"A foto do prato é só referência. Os macros vêm da tabela (TACO/USDA/rótulos). Porção não pesada mostra faixa de ±35% (adotada pelo DOSE; em simulação com erro suposto de 25 a 35% por porção, essa faixa cobre o valor real em cerca de 57% a 94% das vezes, conforme o erro seja comum a todos os itens ou independente); item marcado \"Pesei\" não tem faixa.",ref:"Revisão de estimativa de porção por foto (caleye.fit, consultada em 23/11/2026, é blog de um app); Preprint ACETADA, arXiv 2610.26538 (consultado em 23/11/2026, estudo único na Austrália, ainda sem revisão por pares verificada).",url:"https://arxiv.org/pdf/2610.26538",status:"hipótese (o ±35% é escolha do DOSE, simulada com erro suposto; fontes não revisadas por pares)"});
})();

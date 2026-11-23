// Foto do prato (v8.21): a foto é só referência na tela; quem escolhe os alimentos e a porção é a pessoa.
// Os macros vêm sempre da base (TACO/USDA/rótulos), nunca de um modelo. A foto não é enviada nem guardada.
// Porção não pesada leva faixa de ±35%. Quem pesa itens que antes estimou a olho calibra o próprio erro (tools/sim_foto.js).
(function(){
const norm=t=>String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const baseG=u=>{ const m=String(u).match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i); return m?{q:parseFloat(m[1].replace(',','.')),un:m[2].toLowerCase()}:null; };
const PERN={cafe:'Café da manhã',almoco:'Almoço',lanche:'Lanche',jantar:'Jantar',ceia:'Ceia'};
window.FP_ERRO=0.35;
const st=window._fp={d:null,itens:[],url:null};
const fmt=n=>Math.round(n);

// Perfil do erro da própria pessoa. cal = lista de razões real/estimado (>1: costuma subestimar).
// Regra (simulada em tools/sim_foto.js, S3): n>=8; só corrige se o viés for significativo (|ln mediana| > 1,96*dp/raiz(n)),
// limitado a [0,7; 1,3]; a faixa só estreita (1,28*dp, entre 20% e 35%) com n>=20.
window.fpPerfil=(cal)=>{ const L=(cal||[]).filter(r=>isFinite(r)&&r>0); const n=L.length; const P={bias:1,band:window.FP_ERRO,n,ajustou:false};
  if(n<8) return P; const lr=L.map(Math.log); const m=lr.reduce((a,x)=>a+x,0)/n; const dp=Math.sqrt(lr.reduce((a,x)=>a+(x-m)*(x-m),0)/(n-1));
  const o=[...L].sort((a,b)=>a-b); const md=o[Math.floor(n/2)];
  if(Math.abs(Math.log(md))>1.96*dp/Math.sqrt(n)){ P.bias=Math.min(1.3,Math.max(0.7,md)); P.ajustou=Math.abs(P.bias-1)>=0.02; }
  if(n>=20) P.band=Math.min(window.FP_ERRO,Math.max(0.20,1.28*dp));
  return P; };

// Conta pura (testável): kcal central, macros e faixa só sobre o que não foi pesado.
window.fpCalc=(itens,foods,perfil)=>{ const F=foods||window.FOODS; const P=perfil||{bias:1,band:window.FP_ERRO}; let k=0,p=0,c=0,g=0,inc=0;
  itens.forEach(i=>{ const f=F[i.i]; if(!f) return; const e=i.pesei?1:P.bias; const m=i.m*e; k+=f.k*m; p+=f.p*m; c+=f.c*m; g+=f.g*m; if(!i.pesei) inc+=f.k*m; });
  return {k,p,c,g,lo:k-P.band*inc,hi:k+P.band*inc,inc}; };

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
// Calorias que a foto não mostra: atalhos para óleo, manteiga e molhos que existem na base
const INVIS=['Azeite','Óleo de soja','Manteiga','Maionese tradicional'];
const invis=()=>INVIS.map(n=>window.FOODS.findIndex(f=>f.n===n)).filter(i=>i>=0);

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
window.fpAdd=(i)=>{ if(!window.FOODS[i]) return; const ex=st.itens.find(x=>x.i===i); if(ex&&!ex.pesei){ ex.m+=0.5; ex.tocou=true; } else st.itens.push({i,m:1,pesei:false,tocou:false,est0:null});
  const q=document.getElementById('fpQ'); if(q){ q.value=''; } const b=document.getElementById('fpRes'); if(b) b.innerHTML=''; fpDesenha(); };
window.fpPasso=(n,dv)=>{ const it=st.itens[n]; if(!it||it.pesei) return; it.m=Math.max(0,+(it.m+dv).toFixed(2)); it.tocou=true; if(it.m<=0) st.itens.splice(n,1); fpDesenha(); };
// Pesei: guarda o que a pessoa tinha estimado a olho (só se ela mexeu na porção) e passa a usar o peso real
window.fpPesei=(n)=>{ const it=st.itens[n]; if(!it) return; if(!it.pesei){ it.pesei=true; it.est0=it.tocou?it.m:null; } else { it.pesei=false; if(it.est0){ it.m=it.est0; } it.est0=null; } fpDesenha(); };
window.fpReal=(n,v)=>{ const it=st.itens[n]; if(!it||!it.pesei) return; const f=window.FOODS[it.i]; const b=baseG(f.u); const x=num(v); if(x==null||x<=0) return; it.m=+(b?x/b.q:x).toFixed(3); fpDesenha(); };
const perfil=()=>window.fpPerfil(S.fpCal||[]);
window.fpDesenha=()=>{ const box=document.getElementById('fpPlate'); if(!box) return;
  if(!st.itens.length){ box.innerHTML='<p class="muted small">Escolha os alimentos que estão no prato.</p>'; return; }
  const P=perfil(); const t=window.fpCalc(st.itens,null,P); const faixa=t.inc>0;
  // o item não pesado que mais pesa na faixa: pesar este é o que mais a reduz (simulação S2)
  let top=-1,topK=0; st.itens.forEach((it,n)=>{ if(it.pesei) return; const kk=window.FOODS[it.i].k*it.m; if(kk>topK){ topK=kk; top=n; } });
  const cortaria=top>=0?Math.round(P.band*topK*P.bias):0;
  const linhas=st.itens.map((it,n)=>{ const f=window.FOODS[it.i]; const b=baseG(f.u); const qtd=b?`${fmt(it.m*b.q)} ${b.un}`:`${it.m}× ${esc(f.u)}`;
    return `<div class="card sub" style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><b>${esc(f.n)}</b><div class="tiny">${qtd} · ${fmt(f.k*it.m*(it.pesei?1:P.bias))} kcal</div></div>
    ${it.pesei?'':`<div style="display:flex;align-items:center;gap:6px"><button class="btn sm ghost" style="width:auto;padding:6px 12px" aria-label="Menos" onclick="fpPasso(${n},-0.5)">−</button><span class="mono">${it.m}×</span><button class="btn sm ghost" style="width:auto;padding:6px 12px" aria-label="Mais" onclick="fpPasso(${n},0.5)">+</button></div>`}</div>
    <label class="tiny" style="display:flex;gap:6px;align-items:center;margin-top:6px"><input type="checkbox" ${it.pesei?'checked':''} onchange="fpPesei(${n})"> Pesei esta porção</label>
    ${it.pesei?`<input id="fpR${n}" type="number" inputmode="decimal" step="any" min="0" value="${b?fmt(it.m*b.q):it.m}" placeholder="${b?'Peso real em '+b.un:'Porções reais'}" style="margin-top:6px" onchange="fpReal(${n},this.value)">`:''}
    ${n===top&&faixa&&cortaria>=10?`<div class="tiny" style="margin-top:6px">Pesar este tira cerca de ±${cortaria} kcal da faixa.</div>`:''}</div>`; }).join('');
  const aj=P.ajustou?`<div class="tiny" style="margin-top:4px">Ajustado pelo seu histórico (${P.n} pesagens): você costuma ${P.bias>1?'subestimar':'superestimar'} as porções em cerca de ${Math.round(Math.abs(P.bias-1)*100)}%.</div>`:(P.n>0&&P.n<8?`<div class="tiny" style="margin-top:4px">Com 8 pesagens o app aprende o seu erro (${P.n} até agora). Para valer, estime a porção a olho e depois pese.</div>`:'');
  const iv=invis();
  box.innerHTML=linhas+
  `<div class="card" style="margin-top:6px"><div class="mono" id="fpTot" style="font-size:1.2rem">${faixa?`${fmt(t.lo)} a ${fmt(t.hi)} kcal`:`${fmt(t.k)} kcal`}</div>
   <div class="tiny">${faixa?`Estimativa central ${fmt(t.k)} kcal. Sem pesar, a porção pode variar cerca de ${Math.round(P.band*100)}% para mais ou para menos, e o valor real ainda pode ficar fora da faixa.`:'Tudo pesado: sem faixa.'}</div>
   <div class="tiny" style="margin-top:4px">P ${fmt(t.p)} g · C ${fmt(t.c)} g · G ${fmt(t.g)} g (pela tabela)</div>${aj}</div>
   ${iv.length?`<p class="tiny" style="margin:10px 0 4px">Óleo, manteiga e molhos não aparecem na foto. Tem algum no prato?</p><div class="chips" style="flex-wrap:nowrap;overflow-x:auto">${iv.map(chip).join('')}</div>`:''}
   <div class="grid2" style="margin-top:12px"><button class="btn ghost" onclick="fpCancelar()">Cancelar</button><button class="btn em" onclick="fpSalvar()">Salvar em ${esc(PERN[S._per||'almoco']||'refeição')}</button></div>`; };
window.fpCancelar=()=>{ soltaFoto(); st.itens=[]; closeSheet(); };
window.fpSalvar=()=>{ if(!st.itens.length) return; const d=st.d||(window.R&&R.p&&R.p.d)||today(); const P=perfil();
  S.fpCal=S.fpCal||[];
  st.itens.forEach(it=>{ const f=window.FOODS[it.i]; const b=baseG(f.u); const m=it.m; const e=it.pesei?1:P.bias;
    S.diario.push({id:uid(),data:d,per:S._per||'almoco',nome:f.n,qtd:b?`${fmt(m*b.q)} ${b.un}`:`${m}× ${f.u}`,k:f.k*m*e,p:f.p*m*e,c:f.c*m*e,g:f.g*m*e,est:!it.pesei});
    if(it.pesei&&it.est0>0&&m>0){ const r=m/it.est0; if(r>=0.2&&r<=5) S.fpCal.push(+r.toFixed(3)); } });
  S.fpCal=S.fpCal.slice(-60);
  save(); const n=st.itens.length; soltaFoto(); st.itens=[]; closeSheet(); go('nutricao',{d}); toast(`Refeição salva (${n} ${n===1?'item':'itens'})`); };
window.addEventListener('pagehide',soltaFoto);

// Botão ao lado de "Escanear" na tela Adicionar
const _af=V._addFood; V._addFood=(d)=>{ const h=_af(d); return h.replace(/(Escanear<\/button>)/,`$1<button class="btn sm ghost" style="width:auto;padding:8px 14px;margin-left:6px" onclick="fpAbrir('${d}')">Foto do prato</button>`); };

(window.SCIENCE||[]).push({t:"Estimar porção por foto tem erro: o DOSE mostra faixa e aprende o seu erro",cat:"Nutrição",oque:"Uma foto 2D não traz profundidade nem densidade; o volume de uma porção estimado por foto erra, em média, de 25% a 35% em dados não vistos, e um estudo com refeições pesadas em laboratório achou erro diário individual de cerca de 25% ou mais, com subestimação de proteína.",regra:"A foto do prato é só referência. Os macros vêm da tabela (TACO/USDA/rótulos). Porção não pesada mostra faixa de ±35% (escolha do DOSE; em simulação com erro suposto de 25 a 35% por porção essa faixa cobre o valor real em cerca de 65% a 89% das vezes). Pesar o maior item do prato é o que mais reduz o erro (de 17,6% para 11,6% na simulação). Com 8 ou mais pesagens de itens estimados a olho antes, o app corrige o viés de quem costuma errar sempre para o mesmo lado; a faixa só estreita com 20 ou mais. Item pesado não tem faixa.",ref:"Revisão de estimativa de porção por foto (caleye.fit, consultada em 23/11/2026, é blog de um app); Preprint ACETADA, arXiv 2610.26538 (consultado em 23/11/2026, estudo único na Austrália, sem revisão por pares verificada). Simulações: tools/sim_foto.js, que testam o método com erro suposto, não medem pessoas.",url:"https://arxiv.org/pdf/2610.26538",status:"hipótese (±35%, a calibração e as simulações usam erro suposto; fontes não revisadas por pares)"});
})();

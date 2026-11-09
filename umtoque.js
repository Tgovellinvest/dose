// ================= DOSE · v8.2 — registrar com menos toques, sem digitar (aprovado pelo Tiago em 09/11/2026, Q2 e Q4) =================
// Regra: o app propõe, a pessoa confirma ou corrige.
// 1. Sessão em um toque: "Fiz como da última vez" marca todas as séries com a carga e as repetições da última vez.
//    Quando o coach manda subir (bateu o topo da faixa em todas as séries), a carga já vem com +2,5 kg ou +1 placa (Q2).
// 2. "Segui a dieta hoje": marca todas as refeições da dieta importada; a pessoa desmarca a que não fez.
// 3. "O de sempre": no diário, até 3 refeições que a pessoa repete naquele horário (histórico do próprio aparelho).
// 4. Refeição salva: guarda os itens de uma refeição com nome automático e lança tudo de novo num toque.
// 5. Esporte em um toque: repetir o último registro de cada esporte e chips de duração.
// Nenhum dado sai do aparelho. Incremento de 2,5 kg segue a regra que o coach já usa (sugestaoCarga, app.js).
(function(){
const V=window.VIEWS;
const shift=(d,n)=>{ const x=new Date(d+'T12:00:00'); x.setDate(x.getDate()+n); return x.ymd(); };

// ---------- 1 · sessão em um toque ----------
const _ses=V.sessao; V.sessao=(p)=>{ const h=_ses(p); if(!/class="set-row"/.test(h)) return h;
  const temHist=document&&Object.keys(S.pesos||{}).length>0; if(!temHist) return h;
  const bt=`<div class="card ut-card"><div><b>Fiz como da última vez</b><span class="tiny">Marca todas as séries com a carga da última vez (já com a subida quando o coach manda). Depois toque só no que mudou.</span></div><button class="btn sm sec" onclick="utSessao('${p.s}')">Marcar tudo</button></div>`;
  const i=h.indexOf('<details><summary>Aquecimento'); return i>=0?h.slice(0,i)+bt+h.slice(i):h; };
window.utSessao=(sess)=>{ const pr=programa(); const s=pr.sessoes[sess]; if(!s) return; let n=0, sub=0, sem=0;
  const faixa={}; s.slots.forEach(sl=>{ faixa[resolveEx(sl.ex).id]=sl.reps; });
  document.querySelectorAll('#view .set-row').forEach(r=>{ const ins=r.querySelectorAll('input[data-ex]'); const ck=r.querySelector('.ck'); if(!ins.length||!ck||ck.classList.contains('done')) return;
    const ex=ins[0].dataset.ex, k=+ins[0].dataset.set; const ult=window.ultSet?ultSet(ex,k):null; const last=S.pesos[ex];
    const carga=r.querySelector('input[data-f=peso],input[data-f=placas]'), reps=r.querySelector('input[data-f=reps]');
    const sug=typeof sugestaoCarga==='function'?sugestaoCarga(ex,faixa[ex]):null;
    let v=carga.value!==''?num(carga.value):null;
    if(sug&&sug.up){ if(carga.dataset.f==='placas'&&sug.placas!=null) v=sug.placas; else if(last&&last.peso) v=Math.round((last.peso+2.5)*2)/2; }
    else if(v==null&&ult) v=carga.dataset.f==='placas'?ult.placas:ult.peso;
    let rp=reps.value!==''?num(reps.value):(ult&&ult.reps)||null; if(sug&&sug.up&&reps.value===''){ const mn=parseInt(String(faixa[ex]||'').replace(/\/.*$/,'')); if(mn) rp=mn; }
    if(v==null||!rp){ sem++; return; }
    carga.value=v; reps.value=rp; ck.classList.add('done'); n++; if(sug&&sug.up) sub++; });
  if(window.saveDraft) saveDraft(sess); else if(typeof saveDraft==='function') saveDraft(sess);
  if(navigator.vibrate) try{ navigator.vibrate(18); }catch(e){}
  toast(n?`${n} séries marcadas${sub?` · carga subiu onde o coach mandou`:''}${sem?` · ${sem} sem histórico, preencha`:''}`:'Nenhuma série com histórico para repetir'); };

// ---------- 2 · dieta inteira em um toque ----------
const botaoDieta=h=>h.replace(/(<b class="num" id="dtTot">(\d+) de (\d+)<\/b><\/div>)/,(m,a,f,n)=>{ const d=(h.match(/dtCheck\(this,'(\d{4}-\d{2}-\d{2})'/)||[])[1]; if(!d||+f>=+n) return a; return `${a}<button class="btn sm sec ut-dieta" onclick="utDieta('${d}')">Segui a dieta ${d===today()?'hoje':'nesse dia'}</button>`; });
const _nut=V.nutricao; V.nutricao=(p)=>{ let h=_nut(p); h=botaoDieta(h); if(/<h1 class="sec">Diário<\/h1>/.test(h)) h=diario(h,(p&&p.d)||today()); return h; };
if(V.hoje){ const _hj=V.hoje; V.hoje=(p)=>botaoDieta(_hj(p)); }
window.utDieta=(d)=>{ const dt=S.dieta; if(!dt) return; S.dietaChecks=S.dietaChecks||{}; S.dietaChecks[d]=dt.refeicoes.map(r=>r.id); save(); if(navigator.vibrate) try{ navigator.vibrate(18); }catch(e){} toast('Todas as refeições marcadas. Desmarque a que não fez.'); route(); };

// ---------- 3 e 4 · "o de sempre" e refeição salva ----------
const PER=[["cafe","Café da manhã",5,10],["almoco","Almoço",11,14],["lanche","Lanche",15,18],["jantar","Jantar",19,22],["ceia","Ceia",22,29]];
const perAgora=()=>{ const h=+new Intl.DateTimeFormat('en-GB',{timeZone:'America/Sao_Paulo',hour:'2-digit',hour12:false}).format(new Date()); const x=PER.find(([,,a,b])=>(h<5?h+24:h)>=a&&(h<5?h+24:h)<b); return x?x[0]:'almoco'; };
const assin=its=>its.map(x=>x.nome).sort().join('|');
function deSempre(per,d){ const desde=shift(d,-30); const dias={}; S.diario.filter(x=>x.data>=desde&&x.data<d&&(x.per||'almoco')===per).forEach(x=>{ (dias[x.data]=dias[x.data]||[]).push(x); });
  const c={}; Object.values(dias).forEach(its=>{ const k=assin(its); if(!c[k]) c[k]={n:0,its}; c[k].n++; });
  const hist=Object.values(c).filter(x=>x.n>=2).sort((a,b)=>b.n-a.n).map(x=>({nome:x.its.map(i=>i.nome).slice(0,3).join(', ')+(x.its.length>3?'…':''),itens:x.its,vezes:x.n}));
  const salvas=(S.refSalvas||[]).filter(r=>r.per===per).map(r=>({nome:r.nome,itens:r.itens,salva:r.id}));
  const vistos=new Set(); return [...salvas,...hist].filter(r=>{ const k=assin(r.itens); if(vistos.has(k)) return false; vistos.add(k); return true; }).slice(0,3); }
let ofertas=[];
function diario(h,d){ const per=perAgora(); const nomePer=(PER.find(x=>x[0]===per)||[])[1]; const ja=S.diario.some(x=>x.data===d&&(x.per||'almoco')===per);
  ofertas=ja?[]:deSempre(per,d);
  const box=ofertas.length?`<div class="ut-sempre"><div class="eyebrow" style="text-align:left">O de sempre · ${esc(nomePer)}</div><div class="chips">${ofertas.map((o,i)=>`<button class="chip" onclick="utSempre('${d}','${per}',${i})">${esc(o.nome)}${o.vezes?` <span class="tiny">${o.vezes}×</span>`:''}</button>`).join('')}</div></div>`:'';
  if(box){ const i=h.indexOf('<div class="card hero">'); if(i>=0) h=h.slice(0,i)+box+h.slice(i); }
  // salvar refeição: períodos do dia com 2 itens ou mais
  return h.replace(/(<button class="btn sm ghost" onclick="S\._per='(\w+)';sheet\(V\._addFood\('[\d-]+'\)\)">[^<]*<\/button>)/g,(m,a,k)=>{ const its=S.diario.filter(x=>x.data===d&&(x.per||'almoco')===k); if(its.length<2) return a;
    const sal=(S.refSalvas||[]).some(r=>r.per===k&&assin(r.itens)===assin(its)); return a+(sal?'<span class="tiny ut-sal">Refeição salva</span>':`<button class="btn sm ghost" onclick="utSalvar('${d}','${k}')">Salvar refeição</button>`); }); }
window.utSempre=(d,per,i)=>{ const o=ofertas[i]; if(!o) return; o.itens.forEach(x=>S.diario.push(Object.assign({},x,{id:uid(),data:d,per}))); save(); if(navigator.vibrate) try{ navigator.vibrate(18); }catch(e){} toast(`${o.itens.length} ${o.itens.length===1?'item lançado':'itens lançados'}`); route(); };
window.utSalvar=(d,per)=>{ const its=S.diario.filter(x=>x.data===d&&(x.per||'almoco')===per).map(x=>({nome:x.nome,qtd:x.qtd,k:x.k,p:x.p,c:x.c,g:x.g})); if(its.length<2) return;
  const base=(PER.find(x=>x[0]===per)||[,'Refeição'])[1]; const nome=`${base} · ${its.slice(0,2).map(x=>x.nome.split(/[,(]/)[0].trim()).join(' e ')}${its.length>2?' e mais':''}`;
  S.refSalvas=S.refSalvas||[]; S.refSalvas.push({id:uid(),per,nome:nome.slice(0,60),itens:its}); save(); toast('Refeição salva. Aparece no "o de sempre" desse horário.'); route(); };

// ---------- 5 · esporte em um toque ----------
const INT={baixa:'leve',media:'média',alta:'forte'};
const _le=V._logEsporte; V._logEsporte=(pre)=>{ let h=_le(pre); const vistos=new Set(); const ult=[];
  for(let i=S.bjj.length-1;i>=0&&ult.length<2;i--){ const b=S.bjj[i]; const k=b.esporte||b.tipo; if(!k||vistos.has(k)||!b.min) continue; vistos.add(k); ult.push(b); }
  const rep=ult.length?`<div class="ut-rep"><div class="eyebrow" style="text-align:left">Repetir em um toque</div>${ult.map(b=>`<button class="btn sm sec" onclick="utEsporte('${b.id}')">${esc(b.tipo||'Esporte')} · ${b.min} min${b.intens?` · ${INT[b.intens]||b.intens}`:''}</button>`).join('')}<p class="tiny" style="margin:4px 0 0">Lança hoje igual ao último. Ou preencha abaixo.</p></div>`:'';
  h=h.replace('<label>Data</label>',rep+'<label>Data</label>');
  h=h.replace(/(<input id="esMin" type="number"[^>]*>)/,`$1<div class="chips ut-min">${[30,45,60,90].map(m=>`<button type="button" class="chip" onclick="document.getElementById('esMin').value=${m};this.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===this))">${m}</button>`).join('')}</div>`);
  return h; };
window.utEsporte=(id)=>{ const b=S.bjj.find(x=>x.id===id); if(!b) return; const n=Object.assign({},b,{id:uid(),data:today(),notas:'',dores:{},dorCot:0,dorJo:0}); delete n.rel; delete n.fonte;
  S.bjj.push(n); S.bjj.sort((a,c)=>a.data.localeCompare(c.data)); save(); closeSheet(); toast(`${b.tipo||'Esporte'} registrado`); route(); if(window.SHARE&&SHARE.dose) setTimeout(()=>SHARE.dose('esporte',n.id),350); };
})();

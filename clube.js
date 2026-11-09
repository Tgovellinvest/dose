// ================= DOSE · v7.9 — o clube (aprovado pelo Tiago em 09/11/2026) =================
// 1. Comunidade em três partes só: Pontos, Grupos e Convites. Sem ranking da cidade, sem seguidores, sem curtidas contadas, sem feed aberto.
// 2. Convite como objeto: numerado, 3 por mês, e quem abre vê o "Do excesso à dose" terminar no próprio nome.
// 3. O encontro termina num cartão do grupo (depois da presença confirmada) e puxa o próximo: marcar de novo no ponto ou convidar.
// 4. Cartão de membro no lugar do herói: número, desde quando, esportes, pontos, melhor medalha e semanas seguidas na dose.
// Lentes pedidas pelo Tiago: Jobs (cortar), Zuckerberg (grupos pequenos e o ciclo convite → encontro → cartão), Altman (medir quem volta).
(function(){
const V=window.VIEWS, A=window.AFTER;
const U=()=>window.CLOUD&&CLOUD.user();
const G=()=>window.GRUPOS;
const rpc=(f,a)=>G().rpc(f,a), api=(p,o)=>G().api(p,o);
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const MES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const nr=n=>String(n||0).padStart(4,'0');
const nomeMembro=()=>(S.perfil&&S.perfil.nome)||(G()&&G().apelido&&G().apelido())||'Membro DOSE';
const primeiro=s=>String(s||'').trim().split(/\s+/)[0]||'';
const nomeEsp=k=>({musculacao:"Musculação"})[k]||(((window.SPORTS||[]).find(s=>s.id===k)||{}).nome)||k;
const linkConvite=c=>`${location.origin}${location.pathname}#convite?c=${c}`;

// ---------- membro ----------
let membro=null;
async function meuMembro(){ if(!U()) return null; if(membro) return membro; try{ const r=await rpc('meu_membro',{}); membro=(r&&r[0])||null; if(membro){ S.membro=membro; save(); } }catch(e){ membro=S.membro||null; } return membro; }
function pontosFreq(){ const c={}; Object.values(S.encontros||{}).forEach(e=>{ if(e.ponto) c[e.ponto]=(c[e.ponto]||0)+1; }); return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]); }
function melhorMedalha(){ try{ const L=medalhas().filter(m=>m.tier>0); if(!L.length) return null; L.sort((a,b)=>b.tier-a.tier||b.v/(b.t[2]||1)-a.v/(a.t[2]||1)); return L[0]; }catch(e){ return null; } }
function cartaoMembro(){ const m=S.membro; const esps=[...((S.perfil.diasMusc||[]).length?['Musculação']:[]),...Object.keys(S.perfil.esportes||{}).filter(k=>k!=='outro').map(nomeEsp)];
  const pts=pontosFreq(); const md=melhorMedalha(); const sem=window.streakSemanas?streakSemanas():0; const dias=new Set([...S.logs,...S.bjj,...S.cardio].filter(x=>x.data>=semanaIni()&&x.data<=today()).map(x=>x.data)).size;
  const desde=m&&m.desde?(()=>{ const d=new Date(m.desde+"T12:00:00"); return `${MES[d.getMonth()]} de ${d.getFullYear()}`; })():null;
  return `<div class="cm" role="group" aria-label="Cartão de membro">
   <div class="cm-topo"><span class="cm-marca">DOSE<i>.</i></span><span class="cm-n" id="cmN">${m?`Nº <b>${nr(m.numero)}</b>`:U()?'Nº ····':'Sem número'}</span></div>
   <button class="cm-nome" onclick="go('meuperfil')" aria-label="Editar meu perfil">${esc(S.perfil.nome||'Seu nome')}</button>
   <p class="cm-desde serif">${desde?`Na dose desde ${desde}.`:U()?'Na dose.':'Entre na conta para receber seu número de membro.'}</p>
   <dl class="cm-dl"><div><dt>Esportes</dt><dd>${esps.length?esps.slice(0,3).map(esc).join(' · '):'não informado'}</dd></div>
    <div><dt>Pontos</dt><dd>${pts.length?pts.map(esc).join(' · '):'nenhum encontro ainda'}</dd></div>
    <div><dt>Melhor medalha</dt><dd>${md?`${esc(md.cat)} · ${esc(TIER[md.tier])}`:'nenhuma ainda'}</dd></div></dl>
   <div class="stats cm-stats" id="comStats"><div><b data-count="${sem}">${sem}</b><span>semanas seguidas na dose</span></div><div><b data-count="${dias}">${dias}</b><span>dias nesta semana</span></div><div><span data-k="gr"><b>—</b></span><span>grupos</span><span data-k="pos" hidden></span></div></div>
   ${m&&m.convidado_por_nome?`<div class="tiny cm-conv">Convidado por ${esc(m.convidado_por_nome)}${m.convite_numero?` · convite Nº ${nr(m.convite_numero)}`:''}</div>`:''}
   ${U()?'':`<button class="btn em sm" style="margin-top:12px" onclick="garantirConta(()=>route(),'Entrar no clube')">Entrar na conta</button>`}</div>`; }

// ---------- Comunidade em três partes ----------
const ABAS=[["pontos","Pontos"],["grupos","Grupos"],["convites","Convites"]];
const _vc=V.comunidade; V.comunidade=(p)=>{ const h=_vc(p); const t=document.createElement('template'); t.innerHTML=h; const f=t.content;
  const h1=f.querySelector('h1'); const hero=f.querySelector('.meuhero'); const mapa=f.querySelector('.mp4-entra'); const reg=f.querySelector('#comRegiao');
  [h1,hero,mapa,reg].forEach(n=>n&&n.remove()); const resto=document.createElement('div'); resto.appendChild(f.cloneNode(true));
  const aba=(p&&p.aba)||S.comAba||'pontos';
  const painel=(k,html)=>`<section class="com-p" data-p="${k}" ${aba===k?'':'hidden'}>${html}</section>`;
  return `${h1?h1.outerHTML:'<h1 class="sec">Comunidade</h1>'}${cartaoMembro()}
   <div class="seg com-abas" role="tablist">${ABAS.map(([k,n])=>`<button role="tab" class="${aba===k?'on':''}" onclick="comAba('${k}',this)">${n}</button>`).join('')}</div>
   ${painel('pontos',`${mapa?mapa.outerHTML:''}${reg?reg.outerHTML:''}`)}
   ${painel('grupos',resto.innerHTML)}
   ${painel('convites',`<div id="cvBox">${U()?'<div class="card sub small">carregando…</div>':`<div class="card"><p class="serif" style="margin:0 0 6px">Convite é coisa de membro. <i>Três por mês.</i></p><p class="small">Entre na sua conta para receber seu número e seus convites.</p><button class="btn em sm" onclick="garantirConta(()=>route(),'Para convidar')">Entrar na conta</button></div>`}</div>
     <button class="lk" style="margin-top:6px" onclick="cvTenho()">Recebi um código de convite</button>`)}`; };
window.comAba=(k,b)=>{ S.comAba=k; save(); document.querySelectorAll('.com-p').forEach(s=>s.hidden=s.dataset.p!==k); if(b) b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); };
const _ac=A.comunidade; A.comunidade=(p)=>{ const r=_ac?_ac(p):null;
  meuMembro().then(m=>{ const el=document.getElementById('cmN'); if(el&&m) el.innerHTML=`Nº <b>${nr(m.numero)}</b>`; const d=document.querySelector('.cm-desde'); if(d&&m&&m.desde){ const x=new Date(m.desde+"T12:00:00"); d.textContent=`Na dose desde ${MES[x.getMonth()]} de ${x.getFullYear()}.`; } });
  cvCarregar(); sincEncontros(); return r; };

// ---------- Convites ----------
async function cvCarregar(){ const box=document.getElementById('cvBox'); if(!box||!U()) return;
  try{ const L=await api(`convites?de=eq.${U().id}&select=numero,codigo,para_nome,criado,usado_em&order=criado.desc&limit=50`)||[];
    const ini=new Date(); const mesRio=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit'}).format(ini);
    const doMes=L.filter(c=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit'}).format(new Date(c.criado))===mesRio).length; const livres=Math.max(0,3-doMes);
    const mes=MES[+mesRio.slice(5,7)-1];
    box.innerHTML=`<div class="card cv-cota"><div class="cv-pts" aria-hidden="true">${[0,1,2].map(i=>`<i class="${i<livres?'on':''}"></i>`).join('')}</div><div><b>${livres} ${livres===1?'convite livre':'convites livres'} em ${mes}</b><div class="tiny">Cada membro tem 3 por mês. Quem recebe ganha um número de membro.</div></div></div>
     <button class="btn em" ${livres?'':'disabled'} onclick="cvNovo()">${livres?'Fazer um convite':'Novos convites no mês que vem'}</button>
     ${L.length?`<h3>Seus convites</h3><div class="list">${L.map(c=>`<div class="item" onclick="cvVer('${c.codigo}')"><div class="n"><b class="mono">${nr(c.numero)}</b></div><div class="t"><b>${esc(c.para_nome)}</b><span>${c.usado_em?'Aceito. Já é da comunidade DOSE':'Aguardando'}</span></div><span class="arrow">›</span></div>`).join('')}</div>`:''}`; }
  catch(e){ box.innerHTML=`<div class="card"><b>Não carregou</b><p class="small">${esc(e.message)}</p></div>`; } }
window.cvNovo=()=>{ if(!U()) return garantirConta(cvNovo,'Para convidar');
  sheet(`<h3>Fazer um convite</h3><p class="small">O convite vai com um número e com o seu nome. Escolha alguém que treina com você.</p>
   <label for="cvPara">Nome de quem você vai convidar</label><input id="cvPara" maxlength="40" autocomplete="off" placeholder="Ex.: Ana">
   <label for="cvDe">Como você assina</label><input id="cvDe" maxlength="40" value="${esc(primeiro(nomeMembro()))}">
   <button class="btn em" style="margin-top:12px" onclick="cvCriar()">Criar convite</button><button class="btn sm ghost" style="margin-top:8px" onclick="closeSheet()">Agora não</button>`); setTimeout(()=>{ const i=document.getElementById('cvPara'); if(i) i.focus(); },60); };
window.cvCriar=async()=>{ const para=(document.getElementById('cvPara').value||'').trim(), de=(document.getElementById('cvDe').value||'').trim(); if(para.length<2) return toast('Diga o nome de quem você vai convidar');
  try{ const r=(await rpc('criar_convite',{p_para:para,p_de_nome:de}))[0]; cvMostrar({numero:r.numero,codigo:r.codigo,para_nome:para,de_nome:de||primeiro(nomeMembro())},true); cvCarregar(); }catch(e){ toast(e.message||'Não consegui criar agora'); } };
window.cvVer=async(cod)=>{ try{ const r=(await rpc('ver_convite',{p_codigo:cod}))[0]; if(r) cvMostrar(Object.assign({codigo:cod},r),!r.usado); }catch(e){ toast(e.message); } };
// o objeto do convite (mesmo desenho para quem manda e para quem recebe)
const objeto=(cv,cls='')=>`<div class="cv-obj ${cls}" aria-label="Convite número ${cv.numero} para ${esc(cv.para_nome)}">
  <div class="cv-topo"><span class="cm-marca">DOSE<i>.</i></span><span class="cv-n">Convite Nº <b data-num="${cv.numero}">${nr(cv.numero)}</b></span></div>
  <div class="cv-para">${esc(cv.para_nome)}</div><p class="serif cv-frase">Vida na dose.</p>
  <div class="cv-rod"><span>Convidado por ${esc(cv.de_nome)}</span><span class="mono">${esc(cv.codigo||'')}</span></div></div>`;
function contar(el){ if(!el) return; const fim=+el.dataset.num; if(reduz()||!fim){ el.textContent=nr(fim); return; } const t0=performance.now(), D=900; const f=t=>{ const k=Math.min(1,(t-t0)/D), e=1-Math.pow(1-k,4); el.textContent=nr(Math.round(fim*e)); if(k<1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
function cvMostrar(cv,enviar){ const link=linkConvite(cv.codigo);
  sheet(`<h3>${enviar?'Seu convite':'Convite'}</h3>${objeto(cv,'sobe')}
   ${enviar?`<button class="btn em" style="margin-top:14px" onclick="cvEnviar('${cv.codigo}',${cv.numero},'${esc(cv.para_nome).replace(/'/g,"\\'")}')">${I('share')} Enviar para ${esc(primeiro(cv.para_nome))}</button>
   <button class="btn sm ghost" style="margin-top:8px" onclick="navigator.clipboard.writeText('${link}').then(()=>toast('Link copiado'))">Copiar link</button>`:`<p class="small" style="margin-top:12px">Aceito. ${esc(primeiro(cv.para_nome))} já é da comunidade DOSE.</p>`}`);
  setTimeout(()=>contar(document.querySelector('#sheet .cv-n b')),200); }
window.cvEnviar=async(cod,n,para)=>{ const link=linkConvite(cod); const text=`${primeiro(para)}, separei um dos meus convites da DOSE para você. Convite Nº ${nr(n)}. ${link}`;
  try{ if(navigator.share) await navigator.share({title:'Convite DOSE',text}); else { await navigator.clipboard.writeText(text); toast('Convite copiado'); } }catch(e){} };
window.cvTenho=()=>{ sheet(`<h3>Recebi um convite</h3><label for="cvCod">Código do convite</label><input id="cvCod" maxlength="12" autocapitalize="characters" style="text-transform:uppercase;letter-spacing:.12em" placeholder="8 letras e números"><button class="btn em" style="margin-top:12px" onclick="const c=document.getElementById('cvCod').value.trim();if(c){closeSheet();go('convite',{c})}">Abrir convite</button>`); };

// ---------- Tela do convite (quem recebe) ----------
V.convite=(p)=>{ if(window.setTitle) setTitle('Convite');
  return `<div class="cvt"><div class="m4-exc" aria-hidden="true"><canvas></canvas></div><div id="cvtBox" class="cvt-box"><p class="small" style="text-align:center">Abrindo o convite…</p></div></div>`; };
A.convite=async(p)=>{ document.body.classList.add('cvt-on'); const box=document.getElementById('cvtBox'); const c=(p&&p.c||'').toUpperCase();
  const exc=document.querySelector('.cvt .m4-exc'); if(exc&&window.excessoDose&&!reduz()) window.excessoDose(exc); else if(exc) exc.remove();
  let cv=null; try{ cv=(await rpc('ver_convite',{p_codigo:c}))[0]; }catch(e){}
  if(!box) return; if(!cv){ box.innerHTML=`<h1 class="m2-kin">Convite não<br>encontrado<b class="m2-dot">.</b></h1><p class="small">Confira o código com quem te convidou.</p><button class="btn sec" onclick="go('${S.onboarded?'comunidade':'onboard'}')">Voltar</button>`; return; }
  const atraso=reduz()?0:2300; const pal=[`${primeiro(cv.para_nome)},`,'na','dose'];
  box.innerHTML=`<div class="eyebrow cvt-eb" style="animation-delay:${atraso}ms">Convite Nº <b data-num="${cv.numero}">0000</b></div>
   <h1 class="m2-kin" aria-label="${esc(primeiro(cv.para_nome))}, na dose.">${pal.map((w,i)=>`<span class="w"><span style="animation-delay:${atraso+150+i*90}ms">${esc(w)}${i===pal.length-1?'<b class="m2-dot" style="animation-delay:'+(atraso+800)+'ms">.</b>':''}</span></span>`).join('')}</h1>
   <p class="serif cvt-de" style="animation-delay:${atraso+700}ms">${esc(cv.de_nome)} separou um dos convites do mês para você.</p>
   ${objeto(Object.assign({codigo:c},cv),'cvt-obj')}
   <div class="cvt-acoes" style="animation-delay:${atraso+1300}ms">${cv.usado?`<p class="small">Este convite já foi aceito.</p><button class="btn sec" onclick="go('${S.onboarded?'comunidade':'onboard'}')">Continuar</button>`
     :`<button class="btn em" onclick="cvAceitar('${c}')">Aceitar convite</button><p class="tiny" style="margin-top:8px">Você recebe seu número de membro. Precisa de uma conta.</p>`}</div>`;
  setTimeout(()=>contar(box.querySelector('.cvt-eb b')),atraso+100); };
window.cvAceitar=(c)=>garantirConta(async()=>{ try{ const r=(await rpc('aceitar_convite',{p_codigo:c}))[0]; membro=null; S.membro=Object.assign({},S.membro||{},r); save();
  const box=document.getElementById('cvtBox'); if(box) box.querySelector('.cvt-acoes').innerHTML=`<div class="card cvt-ok"><div class="eyebrow" style="text-align:left">Membro</div><div class="cvt-num">Nº ${nr(r.numero)}</div><p class="small">Bem-vindo à comunidade DOSE.</p></div><button class="btn em" onclick="${S.onboarded?`go('comunidade',{aba:'pontos'})`:`go('onboard')`}">${S.onboarded?'Ver os pontos de treino':'Começar'}</button>`;
 }catch(e){ toast(e.message||'Não consegui aceitar agora'); } },'Para aceitar o convite');
// o convite abre mesmo antes do cadastro
const _r=window.route; window.route=function(){ if(/^#convite/.test(location.hash)&&typeof S!=='undefined'&&!S.onboarded){ const q=Object.fromEntries(new URLSearchParams((location.hash.split('?')[1])||'')); const el=document.getElementById('view'); el.innerHTML=V.convite(q); window.scrollTo(0,0); A.convite(q); return; } document.body.classList.remove('cvt-on'); return _r.apply(this,arguments); };
window.addEventListener('hashchange',()=>{ if(!/^#convite/.test(location.hash)) document.body.classList.remove('cvt-on'); });

// ---------- O encontro termina num cartão ----------
const horaRio=q=>{ const [h,m]=new Date(q).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hour12:false}).split(':').map(Number); return m?`${h}h${String(m).padStart(2,'0')}`:`${h}h`; };
const diaRio=q=>new Date(q).toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
function guardar(t,n){ S.encontros=S.encontros||{}; const ant=S.encontros[t.id]||{}; S.encontros[t.id]={ponto:t.ponto,ponto_id:t.ponto_id||null,quando:t.quando,esporte:t.esporte,n:Math.max(n||0,ant.n||0),visto:ant.visto||false}; save(); return S.encontros[t.id]; }
async function sincEncontros(){ if(!U()) return; try{
  const r=await api(`treino_participantes?user_id=eq.${U().id}&presente=eq.true&select=treino_id,treinos_abertos(id,quando,ponto,ponto_id,esporte)`)||[]; const ts=r.map(x=>x.treinos_abertos).filter(Boolean); if(!ts.length) return;
  const cont=await api(`treino_participantes?treino_id=in.(${ts.map(t=>t.id).join(',')})&presente=eq.true&select=treino_id`).catch(()=>[]); const c={}; (cont||[]).forEach(x=>c[x.treino_id]=(c[x.treino_id]||0)+1);
  let novo=null; ts.forEach(t=>{ const e=guardar(t,(c[t.id]||1)+1); if(!e.visto) novo=t.id; }); if(novo) setTimeout(()=>encontro(novo),600); }catch(e){} }
let ec=null;
const dadosEnc=e=>({eyebrow:`Encontro · ${new Date(diaRio(e.quando)+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'}).replace('.','')}`,titulo:e.ponto,big:{v:e.n,u:e.n===1?'pessoa':'pessoas'},ks:[{v:horaRio(e.quando),l:'horário'},{v:nomeEsp(e.esporte)||'Treino',l:'esporte'}],frase:'Apareceram. Na dose.',fonte:'Presença confirmada por quem organizou'});
window.encontro=async(id)=>{ const e=(S.encontros||{})[id]; if(!e) return; e.visto=true; save(); ec={id,fmt:'feed',foto:null,blob:null};
  sheet(`<div class="eyebrow" style="text-align:left">Presença confirmada</div><h3 style="margin-top:2px">O encontro</h3>
   <div class="seg" style="margin:8px 0"><button class="on" onclick="ecFmt('feed',this)">Feed 4:5</button><button onclick="ecFmt('story',this)">Story 9:16</button></div>
   <div id="ecPrev" class="dd-prev" style="aspect-ratio:4/5"></div>
   <label class="btn sm sec" style="margin-top:10px">${I('plus')} Foto do grupo<input type="file" accept="image/*" hidden onchange="ecFoto(this)"></label><p class="tiny" style="margin:4px 0 0">A foto fica no seu aparelho e só sai se você postar.</p>
   <button class="btn em" style="margin-top:12px" onclick="ecPostar()">${I('share')} Postar</button>
   ${window.GRUPOS?`<button class="btn sec" style="margin-top:8px" onclick="ecGrupo()">${I('users')} Postar no grupo</button>`:''}
   <h3 style="margin-top:18px">E o próximo?</h3><div class="grid2"><button class="btn sm sec" onclick="ecProximo()">Marcar o próximo aqui</button><button class="btn sm ghost" onclick="closeSheet();go('comunidade',{aba:'convites'})">Convidar quem não veio</button></div>
   <button class="btn sm ghost" style="margin-top:8px" onclick="closeSheet()">Agora não</button>`);
  await ecRender(); };
async function ecRender(){ const e=(S.encontros||{})[ec.id]; const c=await window.cartaoDose(ec.fmt,dadosEnc(e),ec.foto); const el=document.getElementById('ecPrev'); if(el){ el.innerHTML=''; const im=new Image(); im.alt='Prévia do cartão do encontro'; im.src=c.toDataURL('image/png'); el.appendChild(im); } ec.blob=await new Promise(r=>c.toBlob(r,'image/png')); }
window.ecProximo=()=>{ const e=(S.encontros||{})[ec.id]; closeSheet(); const i=(window.DOSE_PONTOS||[]).findIndex(p=>p.id===e.ponto_id); if(i>=0&&window.mpMarcar) return mpMarcar(i); if(window.rgNovo){ rgNovo(); setTimeout(()=>{ const p=document.getElementById('taP'); if(p) p.value=e.ponto||''; },30); } };
window.ecFmt=(f,b)=>{ ec.fmt=f; b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); const el=document.getElementById('ecPrev'); if(el) el.style.aspectRatio=f==='story'?'9/16':'4/5'; ecRender(); };
window.ecFoto=async(inp)=>{ const f=inp.files&&inp.files[0]; if(!f) return; try{ ec.foto=await createImageBitmap(f); }catch(e){ const im=new Image(); im.src=URL.createObjectURL(f); await im.decode(); ec.foto=im; } ecRender(); };
window.ecPostar=async()=>{ try{ const file=new File([ec.blob],`dose-encontro-${today()}.png`,{type:'image/png'}); if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'DOSE',text:'Vida na dose.'}); closeSheet(); } else { const u=URL.createObjectURL(ec.blob); const a=document.createElement('a'); a.href=u; a.download=file.name; document.body.appendChild(a); a.click(); a.remove(); toast('Imagem salva'); } }catch(e){} };
window.ecGrupo=()=>{ const e=(S.encontros||{})[ec.id]; window.gpPostarSheet('encontro',{titulo:`Encontro · ${e.ponto}`,linhas:[`${e.n} ${e.n===1?'pessoa':'pessoas'}`,horaRio(e.quando)]}); };
// quem organizou recebe o cartão logo depois de salvar a presença
const _ps=window.rgPresSalvar; if(_ps) window.rgPresSalvar=async(...a)=>{ const s=window._rgPres; await _ps(...a); if(!s) return;
  try{ const t=(await api(`treinos_abertos?id=eq.${s.id}&select=id,quando,ponto,ponto_id,esporte`))[0]; if(t&&s.sel.size){ guardar(t,s.sel.size+1); setTimeout(()=>encontro(t.id),400); } }catch(e){} };
})();
// "Convidar para a DOSE" passa a ser o convite numerado; aba antiga do ranking volta para treinos
window.rgConvidarApp=()=>go('comunidade',{aba:'convites'});
try{ if(S.regiao&&S.regiao.aba==='ranking'){ S.regiao.aba='treinos'; save(); } }catch(e){}

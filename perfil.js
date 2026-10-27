// ================= DOSE · v6.2 — Meu perfil (foto, esportes, Instagram) =================
// A foto é reduzida para 320 px no próprio aparelho e fica no perfil local (e no backup da conta, se houver).
// Nada disso aparece para outras pessoas sem o perfil público; o Instagram só aparece com interesse mútuo.
(function(){
const V=window.VIEWS;
const ESP_EXTRA=[["corrida","Corrida"],["natacao","Natação"],["ciclismo","Ciclismo"],["tenis","Tênis"],["crossfit","CrossFit"],["hyrox","Hyrox"],["bjj","Jiu-jitsu"],["futebol","Futebol"],["boxe","Boxe"],["padel","Padel"],["volei","Vôlei"],["surf","Surf"],["yoga","Yoga"],["caminhada","Caminhada"]];
const listaEsp=()=>{ const m=new Map(); (window.SPORTS||[]).forEach(s=>m.set(s.id,s.nome)); ESP_EXTRA.forEach(([k,n])=>{ if(!m.has(k)) m.set(k,n); }); return [...m.entries()]; };
const nomeE=id=>(listaEsp().find(x=>x[0]===id)||[id,id])[1];
const ini=n=>String(n||"?").trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"?";
const ig=()=>String(S.perfil.instagram||"").replace(/^@/,'').trim();
window.avatarHTML=(cls="")=>`<div class="avatar ${cls}">${S.perfil.foto?`<img src="${S.perfil.foto}" alt="Sua foto">`:esc(ini(S.perfil.nome))}</div>`;
window.V_meuCard=()=>{ const esps=Object.keys(S.perfil.esportes||{}).filter(k=>k!=='outro'); const musc=(S.perfil.diasMusc||[]).length;
  const nada=!S.perfil.foto&&!ig()&&!esps.length;
  return `<div class="card" style="margin-bottom:12px"><div class="mp">${avatarHTML()}<div style="flex:1;min-width:0"><div class="nm">${esc(S.perfil.nome||"Seu perfil")}</div>${ig()?`<a class="ig" href="https://instagram.com/${encodeURIComponent(ig())}" target="_blank" rel="noopener">@${esc(ig())}</a>`:`<span class="tiny">sem Instagram</span>`}
   <div class="chips">${musc?`<span class="chip">Musculação</span>`:""}${esps.map(e=>`<span class="chip">${esc(nomeE(e))}</span>`).join("")}</div></div></div>
   <button class="btn sm ${nada?'em':'sec'}" style="margin-top:12px" onclick="go('meuperfil')">${nada?'Montar meu perfil':'Editar perfil'}</button></div>`; };

V.meuperfil=()=>{ setTitle("Meu perfil"); const esps=new Set(Object.keys(S.perfil.esportes||{}));
  return `<button class="btn sm ghost" onclick="go('comunidade')">‹ Comunidade</button><h1 class="sec">Meu perfil</h1>
  <div class="card"><div class="fotoedit"><div id="mpAv">${avatarHTML('lg')}</div>
    <div class="row" style="gap:8px"><label class="btn sm sec" style="width:auto;cursor:pointer">${I("camera",16)} ${S.perfil.foto?'Trocar foto':'Pôr foto'}<input id="mpFoto" type="file" accept="image/*" style="display:none" onchange="mpFotoSel(this)"></label>${S.perfil.foto?`<button class="btn sm ghost" style="width:auto" onclick="mpFotoTirar()">Tirar</button>`:""}</div></div>
   <label for="mpNome">Nome</label><input id="mpNome" maxlength="40" value="${esc(S.perfil.nome||'')}" placeholder="Como te chamam">
   <label for="mpIg">Instagram</label><div style="position:relative"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--tx3);font-weight:700">@</span><input id="mpIg" maxlength="30" value="${esc(ig())}" placeholder="seuusuario" oninput="this.value=this.value.replace(/^@+/,'').replace(/ /g,'')" autocapitalize="none" autocorrect="off" spellcheck="false" style="padding-left:30px"></div>
   <p class="tiny">Só aparece para alguém quando os dois marcam "treinaria de novo".</p></div>
  <div class="card"><b>Esportes que pratico</b><p class="tiny">Toque para marcar. Os dias de cada esporte você ajusta em Treino.</p>
   <div class="chips" id="mpEsp" style="flex-wrap:wrap;margin-top:8px">${listaEsp().map(([k,n])=>`<button type="button" class="chip ${esps.has(k)?'on':''}" data-k="${k}" onclick="this.classList.toggle('on')">${esc(n)}</button>`).join("")}</div></div>
  <button class="btn em" onclick="mpSalvar()">Salvar perfil</button>
  <p class="tiny" style="margin-top:8px">A foto fica neste aparelho (e no backup da sua conta). Ninguém vê sem você ligar o perfil público.</p>`; };

let fotoNova; // undefined = sem mudança; null = tirar; string = nova
window.mpFotoSel=inp=>{ const f=inp.files&&inp.files[0]; if(!f) return; if(!/^image\//.test(f.type)) return toast("Escolha uma imagem");
  const url=URL.createObjectURL(f); const im=new Image(); im.onload=()=>{ const L=320; const s=Math.min(im.width,im.height); const cv=document.createElement('canvas'); cv.width=cv.height=L; const cx=cv.getContext('2d'); cx.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,L,L); fotoNova=cv.toDataURL('image/jpeg',0.82); URL.revokeObjectURL(url);
    const av=document.getElementById('mpAv'); if(av) av.innerHTML=`<div class="avatar lg"><img src="${fotoNova}" alt="Sua foto"></div>`; }; im.onerror=()=>toast("Não consegui abrir essa imagem"); im.src=url; };
window.mpFotoTirar=()=>{ fotoNova=null; const av=document.getElementById('mpAv'); if(av) av.innerHTML=`<div class="avatar lg">${esc(ini(document.getElementById('mpNome').value))}</div>`; };
window.mpSalvar=()=>{ const nome=document.getElementById('mpNome').value.trim(); const igv=document.getElementById('mpIg').value.trim().replace(/^@/,'').replace(/\s/g,'');
  if(igv&&!/^[A-Za-z0-9._]{1,30}$/.test(igv)) return toast("Instagram: só letras, números, ponto e _");
  if(nome) S.perfil.nome=nome; S.perfil.instagram=igv||null; if(fotoNova!==undefined) S.perfil.foto=fotoNova; fotoNova=undefined;
  const sel=[...document.querySelectorAll('#mpEsp .chip.on')].map(b=>b.dataset.k); const atual=S.perfil.esportes||{}; const novo={}; sel.forEach(k=>novo[k]=atual[k]||[]); if(atual.outro) novo.outro=atual.outro; S.perfil.esportes=novo;
  save(); toast("Perfil salvo");
  // Instagram também vai para o contato protegido do perfil público, se houver conta
  try{ if(window.CLOUD&&CLOUD.user()&&!CLOUD.user().anon&&window.GRUPOS&&GRUPOS.api) GRUPOS.api('contatos',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:CLOUD.user().id,instagram:igv||null})}).catch(()=>{}); }catch(e){}
  go('comunidade'); };

// Cartão no topo da Comunidade
const _vc=V.comunidade; V.comunidade=(p)=>{ const h=_vc(p); return h.replace('<div class="card hero" id="comTopo">',V_meuCard()+'<div class="card hero" id="comTopo">'); };
// Perfil público: Instagram já vem do Meu perfil
const _ap=window.AFTER.perfilpub; window.AFTER.perfilpub=async(p)=>{ if(_ap) await _ap(p); const el=document.getElementById('ppIg'); if(el&&!el.value&&ig()) el.value='@'+ig(); };
})();

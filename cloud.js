// ================= DOSE · conta e sincronização (Supabase, plano grátis) =================
// O app continua 100% funcional sem conta (localStorage). Com conta, o mesmo JSON do backup
// é guardado em public.dados_usuario (uma linha por usuário, RLS: só o dono lê/escreve).
(function(){
const URL_='https://typfaauucqkztdhmbhqb.supabase.co';
const KEY='sb_publishable_MwvaO9YLPu_PwR_MqVQm-Q_QCAEPJHI'; // chave pública (publishable): segura para o cliente, protegida por RLS
const AK='dose-auth-v1';
const H=()=>({'apikey':KEY,'Content-Type':'application/json'});
let sess=null; try{ sess=JSON.parse(localStorage.getItem(AK)); }catch(e){}
const setSess=s=>{ sess=s; try{ s?localStorage.setItem(AK,JSON.stringify(s)):localStorage.removeItem(AK); }catch(e){} };
const expired=()=>!sess||!sess.expires_at||Date.now()/1000>sess.expires_at-60;
async function refresh(){ if(!sess||!sess.refresh_token) return false; const r=await fetch(`${URL_}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:H(),body:JSON.stringify({refresh_token:sess.refresh_token})}); if(!r.ok){ setSess(null); return false; } setSess(await r.json()); return true; }
async function token(){ if(expired()){ if(!(await refresh())) return null; } return sess.access_token; }
const AH=async()=>{ const t=await token(); if(!t) throw new Error("Sessão expirada. Entre de novo."); return Object.assign(H(),{'Authorization':'Bearer '+t}); };
const errMsg=async r=>{ try{ const j=await r.json(); return j.msg||j.error_description||j.message||j.error||r.statusText; }catch(e){ return r.statusText; } };

const C={};
C.user=()=>sess&&sess.user?{id:sess.user.id,email:sess.user.email||null,anon:!!sess.user.is_anonymous,nome:(sess.user.user_metadata||{}).full_name||(sess.user.user_metadata||{}).name||null}:null;
C.entrar=async(email,senha)=>{ const r=await fetch(`${URL_}/auth/v1/token?grant_type=password`,{method:'POST',headers:H(),body:JSON.stringify({email,password:senha})}); if(!r.ok) throw new Error(await errMsg(r)); setSess(await r.json()); return C.user(); };
C.criar=async(email,senha)=>{ const r=await fetch(`${URL_}/auth/v1/signup`,{method:'POST',headers:H(),body:JSON.stringify({email,password:senha,data:{app:'dose'}})}); if(!r.ok) throw new Error(await errMsg(r)); const j=await r.json(); if(j.access_token) setSess(j); return {confirmar:!j.access_token,user:j.user}; };
C.recuperar=async(email)=>{ const r=await fetch(`${URL_}/auth/v1/recover`,{method:'POST',headers:H(),body:JSON.stringify({email})}); if(!r.ok) throw new Error(await errMsg(r)); return true; };
C.sair=async()=>{ try{ const t=await token(); if(t) await fetch(`${URL_}/auth/v1/logout`,{method:'POST',headers:Object.assign(H(),{'Authorization':'Bearer '+t})}); }catch(e){} setSess(null); };
const limpa=()=>{ const o=Object.assign({},S); delete o._draft; return o; };
C.puxar=async()=>{ const u=C.user(); if(!u) return null; const r=await fetch(`${URL_}/rest/v1/dados_usuario?user_id=eq.${u.id}&select=dados,atualizado_em,versao`,{headers:await AH()}); if(!r.ok) throw new Error(await errMsg(r)); const rows=await r.json(); return rows[0]||null; };
C.empurrar=async()=>{ const u=C.user(); if(!u) return false; const r=await fetch(`${URL_}/rest/v1/dados_usuario?on_conflict=user_id`,{method:'POST',headers:Object.assign(await AH(),{'Prefer':'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify({user_id:u.id,dados:limpa(),versao:1})}); if(!r.ok) throw new Error(await errMsg(r)); S.cloud={ultimoSync:new Date().toISOString()}; try{ localStorage.setItem(DB_KEY,JSON.stringify(S)); }catch(e){} return true; };
C.apagarDados=async()=>{ const u=C.user(); if(!u) return false; const r=await fetch(`${URL_}/rest/v1/dados_usuario?user_id=eq.${u.id}`,{method:'DELETE',headers:await AH()}); if(!r.ok) throw new Error(await errMsg(r)); return true; };
C.aplicar=(dados)=>{ const keep={cloud:S.cloud}; Object.keys(S).forEach(k=>delete S[k]); Object.assign(S,JSON.parse(JSON.stringify(DEFAULT)),dados,keep); S.perfil=Object.assign({},DEFAULT.perfil,dados.perfil||{}); save(); };
const temDados=d=>d&&((d.logs||[]).length+(d.bjj||[]).length+(d.cardio||[]).length+(d.checkins||[]).length+(d.pesagens||[]).length+(d.diario||[]).length)>0;
// Primeira sincronização após entrar: decide sem apagar nada por conta própria.
C.primeiraSync=async()=>{ const row=await C.puxar(); const nuvem=row&&row.dados; const local=S;
  if(!temDados(nuvem)&&temDados(local)){ await C.empurrar(); toast("Dados deste aparelho enviados para a conta"); return "enviado"; }
  if(temDados(nuvem)&&!temDados(local)){ C.aplicar(nuvem); toast("Dados da conta carregados"); return "carregado"; }
  if(temDados(nuvem)&&temDados(local)){ return "conflito"; }
  await C.empurrar(); return "vazio"; };
// Envio automático (debounce) sempre que o app salva e há sessão.
let t=null; const save0=window.save; window.save=function(){ save0.apply(this,arguments); if(C.user()&&navigator.onLine){ clearTimeout(t); t=setTimeout(()=>C.empurrar().catch(()=>{}),2500); } };
window.addEventListener('online',()=>{ if(C.user()) C.empurrar().catch(()=>{}); });
// ---------- Integrações: Strava e Saúde do iPhone ----------
const FN=`${URL_}/functions/v1`;
C.STRAVA_CLIENT_ID=''; // preenchido quando o app DOSE for criado em strava.com/settings/api (ID público; o segredo fica só no Supabase)
C.stravaConnect=async()=>{ if(!C.STRAVA_CLIENT_ID) throw new Error("Strava ainda não configurado neste app"); const t=await token(); if(!t) throw new Error("Entre na conta primeiro"); const u=new URL('https://www.strava.com/oauth/authorize'); u.searchParams.set('client_id',C.STRAVA_CLIENT_ID); u.searchParams.set('redirect_uri',`${FN}/strava-auth`); u.searchParams.set('response_type','code'); u.searchParams.set('approval_prompt','auto'); u.searchParams.set('scope','read,activity:read_all'); u.searchParams.set('state',t); location.href=u.toString(); };
C.stravaStatus=async()=>{ const u=C.user(); if(!u) return null; const r=await fetch(`${URL_}/rest/v1/strava_tokens?user_id=eq.${u.id}&select=athlete_id,last_sync`,{headers:await AH()}); if(!r.ok) return null; const rows=await r.json(); return rows[0]||null; };
C.stravaDesconectar=async()=>{ const u=C.user(); if(!u) return; const r=await fetch(`${URL_}/rest/v1/strava_tokens?user_id=eq.${u.id}`,{method:'DELETE',headers:await AH()}); if(!r.ok) throw new Error(await errMsg(r)); };
// Puxa atividades novas e grava em cardio (ou bjj quando for arte marcial), sem duplicar (chave strava_id).
C.stravaSync=async()=>{ const st=await C.stravaStatus(); if(!st) throw new Error("Strava não conectado"); const r=await fetch(`${FN}/strava-sync`,{method:'POST',headers:await AH(),body:JSON.stringify({after:st.last_sync||null})}); const j=await r.json().catch(()=>({})); if(!r.ok||j.error) throw new Error(j.error==='refresh'?"Strava pediu nova autorização. Conecte de novo.":"Erro ao falar com o Strava ("+(j.error||r.status)+")");
  S.cardio=S.cardio||[]; S.bjj=S.bjj||[]; const has=new Set([...S.cardio,...S.bjj].map(x=>x.strava_id).filter(Boolean)); let n=0;
  for(const a of j.activities||[]){ if(has.has(a.strava_id)) continue; n++; const base={id:uid(),strava_id:a.strava_id,data:a.data,min:a.min||null,fc:a.fc||null,rpe:null,notas:(a.nome||'')+(a.elev?` · ${a.elev} m D+`:''),fonte:'strava'};
    if(a.tipo==='BJJ') S.bjj.push(Object.assign(base,{tipo:'Treino',dorCot:null,dorJo:null})); else S.cardio.push(Object.assign(base,{tipo:a.tipo,dist:a.km||null})); }
  S.cardio.sort((a,b)=>a.data.localeCompare(b.data)); S.bjj.sort((a,b)=>a.data.localeCompare(b.data)); if(n) save(); return n; };
// Saúde do iPhone: chave pessoal (uuid) que o Atalho usa para enviar peso, passos, sono, FC repouso e HRV de cada dia.
C.healthKey=async(criar)=>{ const u=C.user(); if(!u) return null; let r=await fetch(`${URL_}/rest/v1/health_keys?user_id=eq.${u.id}&select=key`,{headers:await AH()}); let rows=r.ok?await r.json():[]; if(rows[0]) return rows[0].key; if(!criar) return null;
  r=await fetch(`${URL_}/rest/v1/health_keys`,{method:'POST',headers:Object.assign(await AH(),{'Prefer':'return=representation'}),body:JSON.stringify({user_id:u.id})}); if(!r.ok) throw new Error(await errMsg(r)); rows=await r.json(); return rows[0]&&rows[0].key; };
C.healthKeyNova=async()=>{ const u=C.user(); if(!u) return null; await fetch(`${URL_}/rest/v1/health_keys?user_id=eq.${u.id}`,{method:'DELETE',headers:await AH()}); return C.healthKey(true); };
// Traz os dias enviados pelo Atalho e funde: peso → pesagens; passos/sono/fcrep/hrv → check-in do dia (fonte iphone), sem sobrescrever o que você digitou.
C.healthSync=async()=>{ const u=C.user(); if(!u) return 0; const r=await fetch(`${URL_}/rest/v1/health_daily?user_id=eq.${u.id}&select=data,peso,passos,sono,fcrep,hrv&order=data.desc&limit=400`,{headers:await AH()}); if(!r.ok) throw new Error(await errMsg(r)); const rows=await r.json(); let n=0;
  S.pesagens=S.pesagens||[]; S.checkins=S.checkins||[];
  for(const d of rows){ if(d.peso&&!S.pesagens.some(p=>p.data===d.data)){ S.pesagens.push({data:d.data,peso:Number(d.peso),fonte:'iphone'}); n++; }
    const extra={passos:d.passos,sono:d.sono!=null?Number(d.sono):null,fcrep:d.fcrep,hrv:d.hrv}; if(!Object.values(extra).some(x=>x!=null)) continue;
    let ck=S.checkins.find(c=>c.data===d.data); if(!ck){ ck={id:uid(),data:d.data,fonte:'iphone'}; S.checkins.push(ck); n++; }
    Object.keys(extra).forEach(k=>{ if(extra[k]!=null&&(ck[k]==null||ck.fonte==='iphone')){ if(ck[k]!==extra[k]) n++; ck[k]=extra[k]; } }); }
  S.pesagens.sort((a,b)=>a.data.localeCompare(b.data)); S.checkins.sort((a,b)=>a.data.localeCompare(b.data)); if(n) save(); return n; };
C.healthEndpoint=`${FN}/health-sync`;

// ---------- v6.1: entrar sem cadastro, Google e Apple (PKCE; o app usa # para rotas) ----------
const PK='dose-pkce-v1';
const b64u=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function pkce(){ const a=new Uint8Array(48); crypto.getRandomValues(a); const ver=b64u(a); const ch=b64u(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ver))); return {ver,ch}; }
let _cfg=null; C.provedores=async()=>{ if(_cfg) return _cfg; try{ const r=await fetch(`${URL_}/auth/v1/settings`,{headers:H()}); const j=await r.json(); const ex=j.external||{}; _cfg={google:!!ex.google,apple:!!ex.apple,anon:!!(ex.anonymous_users||j.anonymous_users_enabled)}; }catch(e){ _cfg={google:false,apple:false,anon:false}; } return _cfg; };
C.anonimo=async()=>{ const r=await fetch(`${URL_}/auth/v1/signup`,{method:'POST',headers:H(),body:JSON.stringify({data:{app:'dose'}})}); if(!r.ok){ const m=await errMsg(r); throw new Error(/anonymous/i.test(m)?"Entrar sem cadastro ainda não foi ativado no servidor.":m); } setSess(await r.json()); return C.user(); };
C.oauth=async(provider)=>{ const cfg=await C.provedores(); if(!cfg[provider]) throw new Error(`Entrar com ${provider==='google'?'Google':'Apple'} ainda não foi ativado.`);
  const {ver,ch}=await pkce(); try{ localStorage.setItem(PK,JSON.stringify({ver,volta:location.hash||'#hoje',t:Date.now(),ligar:!!(C.user()&&C.user().anon)})); }catch(e){}
  const redir=location.origin+location.pathname; const q=`provider=${provider}&redirect_to=${encodeURIComponent(redir)}&code_challenge=${ch}&code_challenge_method=s256`;
  if(C.user()&&C.user().anon){ const r=await fetch(`${URL_}/auth/v1/user/identities/authorize?${q}&skip_http_redirect=true`,{headers:await AH()}); if(r.ok){ const j=await r.json(); if(j.url){ location.href=j.url; return; } } }
  location.href=`${URL_}/auth/v1/authorize?${q}`; };
C.retornoOAuth=async()=>{ const u=new URL(location.href); const code=u.searchParams.get('code'), err=u.searchParams.get('error_description')||u.searchParams.get('error'); if(!code&&!err) return null;
  let st=null; try{ st=JSON.parse(localStorage.getItem(PK)||'null'); localStorage.removeItem(PK); }catch(e){}
  history.replaceState(null,'',location.pathname+((st&&st.volta)||'#hoje'));
  if(err) throw new Error(decodeURIComponent(err).replace(/\+/g,' '));
  if(!st||!st.ver) throw new Error("Login expirou. Tente de novo.");
  const r=await fetch(`${URL_}/auth/v1/token?grant_type=pkce`,{method:'POST',headers:H(),body:JSON.stringify({auth_code:code,code_verifier:st.ver})}); if(!r.ok) throw new Error(await errMsg(r)); setSess(await r.json()); return C.user(); };
C.ATALHO_URL=null; // link iCloud do atalho pronto (Tiago monta uma vez e compartilha)
C._ah=AH;
window.CLOUD=C;

// ---------- UI: Mais → Conta ----------
window.V_conta=function(){ setTimeout(()=>window.ajustaLogin&&ajustaLogin(),0); const u=C.user(); const last=S.cloud&&S.cloud.ultimoSync?new Date(S.cloud.ultimoSync):null;
  const sociais=`<div class="col" style="gap:8px;margin-top:10px">${window.BTN_GOOGLE()}</div>`;
  if(u&&u.anon) return `<div class="card"><b>Você está sem cadastro</b><p class="small">Seus grupos e o backup estão ligados a este aparelho. Conecte o Google para não perder nada se trocar de celular.</p>${sociais}<button class="btn ghost" style="margin-top:8px" onclick="contaSair()">Sair (os dados ficam no aparelho)</button></div>`;
  if(!u) return `<div class="card"><b>Sua conta, seus dados</b><p class="small">Sem conta o app funciona do mesmo jeito, só neste aparelho. Com conta, o histórico fica guardado, você entra em grupos e abre no celular e no computador. Leva um toque com o Google.</p>${sociais}
    <button class="btn sec" data-prov="anon" hidden style="margin-top:8px" onclick="contaAnonimo()">Entrar sem cadastro</button>
    <details data-prov-fallback style="margin-top:10px"><summary class="small" style="cursor:pointer;min-height:36px;display:flex;align-items:center">Prefiro e-mail e senha</summary>
    <label>E-mail</label><input id="acEmail" type="email" autocomplete="email" placeholder="voce@exemplo.com"><label>Senha (mín. 8)</label><input id="acSenha" type="password" autocomplete="current-password" minlength="8">
    <div class="grid2" style="margin-top:10px"><button class="btn em" onclick="contaEntrar()">Entrar</button><button class="btn sec" onclick="contaCriar()">Criar conta</button></div>
    <button class="btn sm ghost" style="margin-top:8px" onclick="contaRecuperar()">Esqueci a senha</button></details>
    <p class="tiny" style="margin-top:10px">Guardamos só o que o app já guarda no aparelho (perfil, treinos, check-ins, diário). Nada é vendido nem compartilhado. Você apaga tudo quando quiser, aqui mesmo.</p><p class="tiny">Ao criar conta ou entrar, você concorda com os <a href="termos.html" target="_blank" rel="noopener">Termos de Uso</a> e a <a href="privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>.</p></div>`;
  setTimeout(()=>window.integraPintar&&integraPintar(),0);
  return `<div class="card"><b>${esc(u.email||u.nome||"Sua conta")}</b><p class="small">Sincronização automática ligada. Último envio: ${last?last.toLocaleString('pt-BR'):"ainda não"}.</p>
    <div class="grid2" style="margin-top:10px"><button class="btn sec" onclick="contaSync('push')">Enviar agora</button><button class="btn sec" onclick="contaSync('pull')">Baixar da conta</button></div>
    <button class="btn ghost" style="margin-top:8px" onclick="contaSair()">Sair (os dados ficam no aparelho)</button></div>
    <div class="card" id="cardIntegra"><b>Conectar apps</b><p class="small">Relógio, Garmin, Apple Watch e apps de corrida entram pelo Strava. Peso, passos, sono e frequência cardíaca entram pela Saúde do iPhone. Nada sai do DOSE para eles.</p>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:8px"><div><b>Strava</b><div class="tiny" id="stravaInfo">verificando…</div></div><div id="stravaBtn"></div></div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:12px"><div><b>Saúde do iPhone</b><div class="tiny" id="healthInfo">${S.saude&&S.saude.ok?'conectada · última vez '+new Date(S.saude.ok).toLocaleDateString('pt-BR'):'peso, passos, sono e batimentos'}</div></div><button class="btn sm sec" onclick="${S.saude&&S.saude.ok?'healthSincronizar()':'healthAbrir()'}">${S.saude&&S.saude.ok?'Sincronizar':'Conectar'}</button></div>
      <button class="btn sm ghost" style="margin-top:10px" onclick="integraSync()">Buscar novidades agora</button></div>
    <div class="card"><b>Privacidade</b><p class="small">Apagar os dados da conta remove o histórico do servidor; o que está neste aparelho continua. Para encerrar a conta por completo, apague os dados e escreva para o e-mail de suporte indicado no site.</p><button class="btn danger sm" onclick="contaApagar()">Apagar meus dados da conta</button></div>`;
};
const v=id=>(document.getElementById(id)||{}).value||"";
window.contaEntrar=async()=>{ try{ await C.entrar(v('acEmail').trim(),v('acSenha')); const r=await C.primeiraSync(); if(r==="conflito") sheet(`<h3>Há dados nos dois lugares</h3><p class="small">Este aparelho e a conta têm histórico. Qual vale?</p><div class="col"><button class="btn em" onclick="closeSheet();contaSync('pull')">Usar os da conta (substitui este aparelho)</button><button class="btn sec" onclick="closeSheet();contaSync('push')">Usar os deste aparelho (substitui a conta)</button></div><p class="tiny">Antes de escolher, exporte um backup em Mais → Dados se tiver dúvida.</p>`); go('mais',{t:'conta'}); }catch(e){ toast(e.message); } };
window.contaCriar=async()=>{ const email=v('acEmail').trim(), senha=v('acSenha'); if(senha.length<8) return toast("Senha com pelo menos 8 caracteres"); try{ const r=await C.criar(email,senha); if(r.confirmar){ sheet(`<h3>Confirme o e-mail</h3><p class="small">Enviamos um link para <b>${esc(email)}</b>. Abra, confirme e volte aqui para entrar.</p>`); } else { await C.primeiraSync(); go('mais',{t:'conta'}); } }catch(e){ toast(e.message); } };
window.contaRecuperar=async()=>{ const email=v('acEmail').trim(); if(!email) return toast("Digite o e-mail"); try{ await C.recuperar(email); toast("Link de recuperação enviado"); }catch(e){ toast(e.message); } };
window.contaSair=async()=>{ await C.sair(); toast("Saiu da conta"); go('mais',{t:'conta'}); };
window.contaSync=async(dir)=>{ try{ if(dir==='push'){ await C.empurrar(); toast("Enviado"); } else { const row=await C.puxar(); if(!row) return toast("Nada na conta ainda"); C.aplicar(row.dados); toast("Carregado da conta"); } go('mais',{t:'conta'}); }catch(e){ toast(e.message); } };
// Integrações (UI). Preenche o status do Strava depois que a tela monta.
window.integraPintar=async()=>{ const el=document.getElementById('stravaInfo'), bt=document.getElementById('stravaBtn'); if(!el||!bt) return; try{ const st=await C.stravaStatus();
  if(st){ el.textContent=`conectado · atleta ${st.athlete_id}${st.last_sync?` · última busca ${new Date(st.last_sync).toLocaleDateString('pt-BR')}`:''}`; bt.innerHTML=`<button class="btn sm ghost" onclick="stravaDesconectar()">Desconectar</button>`; }
  else if(!C.STRAVA_CLIENT_ID){ el.textContent='em breve (aguardando aprovação do app no Strava)'; bt.innerHTML=`<button class="btn sm sec" disabled>Conectar</button>`; }
  else { el.textContent='não conectado'; bt.innerHTML=`<button class="btn sm sec" onclick="stravaConectar()">Conectar</button>`; } }catch(e){ el.textContent='não foi possível verificar'; } };
window.stravaConectar=async()=>{ try{ await C.stravaConnect(); }catch(e){ toast(e.message); } };
window.stravaDesconectar=async()=>{ if(!confirm("Desconectar o Strava? Os treinos já importados ficam.")) return; try{ await C.stravaDesconectar(); toast("Strava desconectado"); integraPintar(); }catch(e){ toast(e.message); } };
window.integraSync=async()=>{ let msg=[]; try{ const st=await C.stravaStatus(); if(st){ const n=await C.stravaSync(); msg.push(n?`${n} treino(s) do Strava`:"Strava: nada novo"); } }catch(e){ msg.push(e.message); }
  try{ const n=await C.healthSync(); msg.push(n?`${n} dado(s) da Saúde`:"Saúde: nada novo"); }catch(e){ msg.push(e.message); } toast(msg.join(" · ")); integraPintar(); };
// v6.7 · Saúde do iPhone para qualquer pessoa: 1 link para instalar o atalho pronto + 1 botão "Sincronizar".
// O DOSE abre o atalho já levando a chave da pessoa (nada de copiar e colar). O atalho guarda a chave para rodar sozinho depois.
C.ATALHO_NOME='Sincronizar DOSE';
const ehIOS=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
window.saudeEstado=()=>(S.saude=S.saude||{});
window.healthAbrir=()=>garantirConta(()=>healthSheet(),"Para conectar a Saúde");
window.healthSheet=async()=>{ let key=null; try{ key=await C.healthKey(true); }catch(e){ return toast(e.message); } if(!key) return toast("Entre na conta primeiro");
  const st=saudeEstado(), ios=ehIOS(), pronto=!!C.ATALHO_URL;
  const passo=(n,t,d,btn,ok)=>`<div class="hpasso${ok?' ok':''}"><span class="hp-n">${ok?'✓':n}</span><div style="flex:1"><b>${t}</b><div class="small">${d}</div>${btn||''}</div></div>`;
  if(!ios) return sheet(`<h3>Saúde do iPhone</h3><p class="small">Essa conexão funciona no iPhone. Abra o DOSE no Safari do seu iPhone, entre com a mesma conta e toque em <b>Conectar Saúde</b>.</p><p class="small">No Android ou no computador, use o check-in do dia ou conecte o Strava.</p>`);
  sheet(`<h3>Conectar Saúde</h3><p class="small">Peso, passos, sono e batimentos do iPhone e do Apple Watch entram no DOSE. Leva menos de 1 minuto, uma vez só.</p>
   ${pronto?`${passo(1,'Instale o atalho do DOSE','Toque abaixo e depois em <b>Adicionar atalho</b>. Volte para cá.',`<a class="btn em sm" style="margin-top:8px;width:auto" href="${C.ATALHO_URL}" target="_blank" rel="noopener" onclick="saudeEstado().instalado=Date.now();save()">Adicionar atalho</a>`,st.instalado)}
   ${passo(2,'Sincronize','Na primeira vez, o iPhone pergunta se pode ler a Saúde: toque em <b>Permitir</b>. Depois volte para o DOSE.',`<button class="btn ${st.instalado?'em':'sec'} sm" style="margin-top:8px;width:auto" onclick="closeSheet();healthSincronizar()">Sincronizar agora</button>`,st.ok)}`
   :`<div class="card" style="margin:10px 0"><b>Em breve</b><p class="small">O atalho pronto do DOSE está sendo publicado. Assim que sair, aqui vai ter só um botão.</p><button class="btn sm ghost" style="width:auto" onclick="closeSheet();healthSincronizar(true)">Já tenho o atalho · sincronizar</button></div>`}
   <details style="margin-top:10px"><summary class="small" style="min-height:40px;display:flex;align-items:center;cursor:pointer">Quero que sincronize sozinho todo dia</summary>
    <p class="small">No app <b>Atalhos</b>: aba <b>Automação</b> → <b>+</b> → <b>Hora do Dia</b> (ex.: 9:00, Diariamente) → <b>Executar Imediatamente</b> → escolha <b>${C.ATALHO_NOME}</b>. Funciona depois que você sincronizou pelo DOSE pelo menos uma vez.</p></details>
   <details style="margin-top:4px"><summary class="small" style="min-height:40px;display:flex;align-items:center;cursor:pointer">Deu erro?</summary>
    <p class="small">• "Atalho não encontrado": confira se o nome no app Atalhos é exatamente <b>${C.ATALHO_NOME}</b>.<br>• Nada chegou: abra Ajustes → Saúde → Acesso a Dados → Atalhos e ligue tudo.<br>• Trocou de celular ou acha que a chave vazou: gere outra abaixo e sincronize de novo pelo DOSE.</p>
    <button class="btn sm ghost" style="width:auto" onclick="healthNovaChave()">Gerar nova chave</button></details>`); };
// Abre o atalho levando a chave; quando a pessoa volta ao DOSE, busca o que chegou.
window.healthSincronizar=(teste)=>garantirConta(async()=>{ if(!C.ATALHO_URL&&teste!==true) return healthSheet(); if(!ehIOS()) return healthSheet();
  let key=null; try{ key=await C.healthKey(true); }catch(e){ return toast(e.message); } if(!key) return;
  window._saudeEsperando=Date.now();
  location.href=`shortcuts://run-shortcut?name=${encodeURIComponent(C.ATALHO_NOME)}&input=text&text=${encodeURIComponent(key)}`; },"Para conectar a Saúde");
window.healthBuscarVolta=async()=>{ const t0=window._saudeEsperando; if(!t0||Date.now()-t0>10*60e3) return; window._saudeEsperando=null;
  for(let i=0;i<4;i++){ await new Promise(r=>setTimeout(r,i?2000:800)); try{ const n=await C.healthSync(); const r=await fetch(`${URL_}/rest/v1/health_daily?user_id=eq.${C.user().id}&select=atualizado_em&order=atualizado_em.desc&limit=1`,{headers:await AH()}); const j=r.ok?await r.json():[]; const recente=j[0]&&new Date(j[0].atualizado_em).getTime()>t0-60e3;
    if(recente){ const st=saudeEstado(); st.ok=Date.now(); st.instalado=st.instalado||Date.now(); save(); toast(n?`Saúde sincronizada · ${n} dado(s) novos`:"Saúde sincronizada"); if(typeof route==='function') route(); return; } }catch(e){} }
  toast("Ainda não chegou nada da Saúde. Toque em Sincronizar de novo ou veja “Deu erro?”"); };
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') healthBuscarVolta(); });
window.addEventListener('pageshow',()=>healthBuscarVolta());
// Atalho no Hoje: um toque para sincronizar (só no iPhone, com o atalho já publicado).
window.V_saudeChip=()=>{ if(!C.ATALHO_URL||!ehIOS()) return ''; const st=saudeEstado(); const hoje=st.ok&&new Date(st.ok).toDateString()===new Date().toDateString();
  if(hoje) return ''; return `<button class="saude-chip" onclick="${st.ok?'healthSincronizar()':'healthAbrir()'}"><span class="sc-dot"></span>${st.ok?'Sincronizar Saúde e Apple Watch':'Conectar Saúde e Apple Watch'}<span class="sc-go">›</span></button>`; };
window.healthNovaChave=async()=>{ if(!confirm("Gerar nova chave? A antiga para de funcionar e você precisa atualizar o Atalho.")) return; try{ const k=await C.healthKeyNova(); const el=document.getElementById('hkTxt'); if(el) el.textContent=k; toast("Nova chave gerada. Toque em Sincronizar de novo."); }catch(e){ toast(e.message); } };
// Volta do Strava (strava-auth redireciona para #mais?t=conta&strava=ok|negado|erro|...)
(function(){ const m=location.hash.match(/[?&]strava=([a-z]+)/); if(!m) return; const s=m[1]; history.replaceState(null,'',location.pathname+location.search+'#mais?t=conta');
  const MSG={ok:"Strava conectado!",negado:"Você não autorizou o Strava",erro:"Erro ao conectar o Strava",semconfig:"Strava ainda não configurado",sessao:"Sessão expirou. Entre e tente de novo",token:"Strava recusou a autorização"};
  window.addEventListener('load',()=>{ setTimeout(()=>{ toast(MSG[s]||s); if(s==='ok') integraSync(); },600); }); })();
// Ao abrir o app com conta: busca silenciosa de novidades (Strava/Saúde), no máximo 1x a cada 6 h.
window.addEventListener('load',()=>{ setTimeout(async()=>{ if(!C.user()||!navigator.onLine) return; const last=S.cloud&&S.cloud.ultimaIntegra?new Date(S.cloud.ultimaIntegra).getTime():0; if(Date.now()-last<6*3600e3) return;
  let n=0; try{ if(await C.stravaStatus()) n+=await C.stravaSync(); }catch(e){} try{ n+=await C.healthSync(); }catch(e){} S.cloud=Object.assign({},S.cloud,{ultimaIntegra:new Date().toISOString()}); try{ localStorage.setItem(DB_KEY,JSON.stringify(S)); }catch(e){} if(n){ toast(`${n} novidade(s) dos seus apps`); if(typeof route==='function') route(); } },4000); });
window.contaApagar=async()=>{ if(!confirm("Apagar o histórico guardado na conta? O que está neste aparelho continua.")) return; try{ await C.apagarDados(); toast("Dados da conta apagados"); }catch(e){ toast(e.message); } };

window.ajustaLogin=async()=>{ const cfg=await C.provedores(); let n=0; document.querySelectorAll('[data-prov]').forEach(b=>{ const on=!!cfg[b.dataset.prov]; b.hidden=!on; if(on&&b.offsetParent!==null||on) n++; }); document.querySelectorAll('[data-prov-fallback]').forEach(f=>{ if(f.tagName==='DETAILS'){ if(!n) f.open=true; } else f.hidden=!!n; }); };
window.BTN_GOOGLE=()=>`<button class="gbtn" data-prov="google" hidden onclick="contaOAuth('google')"><span class="gbtn-ic"><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg></span><span>Continuar com Google</span></button>`;
window.contaOAuth=async(p)=>{ try{ await C.oauth(p); }catch(e){ toast(e.message); } };
window.contaAnonimo=async(depois)=>{ try{ await C.anonimo(); toast("Pronto. Você já pode criar e entrar em grupos."); if(typeof depois==='function') depois(); else route(); }catch(e){ toast(e.message); } };
// Pede conta só na hora em que precisa (criar/entrar em grupo, desafio)
window.garantirConta=(acao,motivo)=>{ if(C.user()) return acao(); window._depoisConta=acao;
  setTimeout(()=>ajustaLogin(),0); sheet(`<h3>${esc(motivo||"Para criar o grupo")}</h3><p class="small">Escolha como entrar.</p><div class="col" style="gap:8px">${window.BTN_GOOGLE()}<button class="btn sec" data-prov="anon" hidden onclick="closeSheet();contaAnonimo(window._depoisConta)">Entrar sem cadastro</button><button class="btn em" data-prov-fallback hidden onclick="closeSheet();go('mais',{t:'conta'})">Entrar com e-mail</button></div><p class="tiny" style="margin-top:8px">Sem cadastro, os grupos ficam ligados a este aparelho. Ao continuar, você concorda com os <a href="termos.html" target="_blank" rel="noopener">Termos</a> e a <a href="privacidade.html" target="_blank" rel="noopener">Privacidade</a>.</p>`); };
document.addEventListener('DOMContentLoaded',async()=>{ try{ const u=await C.retornoOAuth(); if(u){ toast("Conta conectada"); try{ const r=await C.primeiraSync(); if(r==="conflito") go('mais',{t:'conta'}); }catch(e){} route(); } }catch(e){ toast(e.message); } });
})();

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
C.user=()=>sess&&sess.user?{id:sess.user.id,email:sess.user.email}:null;
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
window.CLOUD=C;

// ---------- UI: Mais → Conta ----------
window.V_conta=function(){ const u=C.user(); const last=S.cloud&&S.cloud.ultimoSync?new Date(S.cloud.ultimoSync):null;
  if(!u) return `<div class="card"><b>Sua conta, seus dados</b><p class="small">Sem conta o app funciona do mesmo jeito, só neste aparelho. Com conta, o histórico fica guardado e você abre no celular e no computador. Só e-mail e senha; nada de rede social.</p>
    <label>E-mail</label><input id="acEmail" type="email" autocomplete="email" placeholder="voce@exemplo.com"><label>Senha (mín. 8)</label><input id="acSenha" type="password" autocomplete="current-password" minlength="8">
    <div class="grid2" style="margin-top:10px"><button class="btn em" onclick="contaEntrar()">Entrar</button><button class="btn sec" onclick="contaCriar()">Criar conta</button></div>
    <button class="btn sm ghost" style="margin-top:8px" onclick="contaRecuperar()">Esqueci a senha</button>
    <p class="tiny" style="margin-top:10px">Guardamos só o que o app já guarda no aparelho (perfil, treinos, check-ins, diário). Nada é vendido nem compartilhado. Você apaga tudo quando quiser, aqui mesmo.</p><p class="tiny">Ao criar conta ou entrar, você concorda com os <a href="termos.html" target="_blank" rel="noopener">Termos de Uso</a> e a <a href="privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>.</p></div>`;
  setTimeout(()=>window.integraPintar&&integraPintar(),0);
  return `<div class="card"><b>${esc(u.email)}</b><p class="small">Sincronização automática ligada. Último envio: ${last?last.toLocaleString('pt-BR'):"ainda não"}.</p>
    <div class="grid2" style="margin-top:10px"><button class="btn sec" onclick="contaSync('push')">Enviar agora</button><button class="btn sec" onclick="contaSync('pull')">Baixar da conta</button></div>
    <button class="btn ghost" style="margin-top:8px" onclick="contaSair()">Sair (os dados ficam no aparelho)</button></div>
    <div class="card" id="cardIntegra"><b>Conectar apps</b><p class="small">Relógio, Garmin, Apple Watch e apps de corrida entram pelo Strava. Peso, passos, sono e frequência cardíaca entram pela Saúde do iPhone. Nada sai do DOSE para eles.</p>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:8px"><div><b>Strava</b><div class="tiny" id="stravaInfo">verificando…</div></div><div id="stravaBtn"></div></div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:12px"><div><b>Saúde do iPhone</b><div class="tiny" id="healthInfo">via Atalhos, 1 vez por dia</div></div><button class="btn sm sec" onclick="healthAbrir()">Configurar</button></div>
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
window.healthAbrir=async()=>{ let key=null; try{ key=await C.healthKey(true); }catch(e){ return toast(e.message); } if(!key) return toast("Entre na conta primeiro");
  sheet(`<h3>Saúde do iPhone → DOSE</h3><p class="small">O iPhone não deixa sites lerem a Saúde direto. O caminho é um <b>Atalho</b> que roda sozinho todo dia e manda para a sua conta: peso, passos, sono, FC em repouso e HRV. Leva uns 5 minutos para montar, uma vez só.</p>
    <div class="card" style="margin:10px 0"><b>Sua chave pessoal</b><div class="mono" style="word-break:break-all;margin:6px 0" id="hkTxt">${esc(key)}</div><div class="grid2"><button class="btn sm sec" onclick="navigator.clipboard.writeText('${esc(key)}').then(()=>toast('Chave copiada'))">Copiar chave</button><button class="btn sm ghost" onclick="healthNovaChave()">Gerar nova</button></div><p class="tiny">Quem tiver a chave consegue enviar dados para a sua conta (só enviar; nunca ler). Se vazar, gere outra.</p></div>
    <b>Montar o Atalho (iOS 17+)</b>
    <ol class="small" style="padding-left:18px;line-height:1.55">
      <li>Abra <b>Atalhos</b> → <b>+</b> → nome <b>DOSE Saúde</b>.</li>
      <li>Ação <b>Buscar Amostras de Saúde</b>: Tipo <b>Peso</b>, Ordenar por Data de início, Limite 1. (Renomeie a variável para <b>peso</b>.)</li>
      <li>Repita para <b>Passos</b> (hoje, somar), <b>Sono</b> (ontem à noite, somar, em horas → <b>sono</b>), <b>Frequência cardíaca em repouso</b> (último → <b>fcrep</b>) e <b>Variabilidade da FC</b> (último → <b>hrv</b>). Pode pular o que não usa.</li>
      <li>Ação <b>Obter Conteúdo de URL</b>: URL <span class="mono" style="word-break:break-all">${C.healthEndpoint}</span> · Método <b>POST</b> · Corpo <b>JSON</b> com os campos: <b>key</b> = sua chave, <b>peso</b>, <b>passos</b>, <b>sono</b>, <b>fcrep</b>, <b>hrv</b> (cada um com a variável correspondente).</li>
      <li>Rode uma vez e autorize o acesso à Saúde. Depois, em <b>Automação</b> → <b>Hora do dia</b> (ex.: 9h, diariamente) → <b>Executar imediatamente</b>, escolha o atalho.</li>
    </ol>
    <p class="tiny">Dica: com <b>Automação</b> sem confirmação, o envio acontece sozinho. No DOSE, toque em <b>Buscar novidades agora</b> ou simplesmente abra o app: os dados entram em Progresso (peso) e nos check-ins do dia.</p>
    <button class="btn em" style="margin-top:8px" onclick="closeSheet();integraSync()">Já configurei, buscar agora</button>`); };
window.healthNovaChave=async()=>{ if(!confirm("Gerar nova chave? A antiga para de funcionar e você precisa atualizar o Atalho.")) return; try{ const k=await C.healthKeyNova(); const el=document.getElementById('hkTxt'); if(el) el.textContent=k; toast("Nova chave gerada"); }catch(e){ toast(e.message); } };
// Volta do Strava (strava-auth redireciona para #mais?t=conta&strava=ok|negado|erro|...)
(function(){ const m=location.hash.match(/[?&]strava=([a-z]+)/); if(!m) return; const s=m[1]; history.replaceState(null,'',location.pathname+location.search+'#mais?t=conta');
  const MSG={ok:"Strava conectado!",negado:"Você não autorizou o Strava",erro:"Erro ao conectar o Strava",semconfig:"Strava ainda não configurado",sessao:"Sessão expirou. Entre e tente de novo",token:"Strava recusou a autorização"};
  window.addEventListener('load',()=>{ setTimeout(()=>{ toast(MSG[s]||s); if(s==='ok') integraSync(); },600); }); })();
// Ao abrir o app com conta: busca silenciosa de novidades (Strava/Saúde), no máximo 1x a cada 6 h.
window.addEventListener('load',()=>{ setTimeout(async()=>{ if(!C.user()||!navigator.onLine) return; const last=S.cloud&&S.cloud.ultimaIntegra?new Date(S.cloud.ultimaIntegra).getTime():0; if(Date.now()-last<6*3600e3) return;
  let n=0; try{ if(await C.stravaStatus()) n+=await C.stravaSync(); }catch(e){} try{ n+=await C.healthSync(); }catch(e){} S.cloud=Object.assign({},S.cloud,{ultimaIntegra:new Date().toISOString()}); try{ localStorage.setItem(DB_KEY,JSON.stringify(S)); }catch(e){} if(n){ toast(`${n} novidade(s) dos seus apps`); if(typeof route==='function') route(); } },4000); });
window.contaApagar=async()=>{ if(!confirm("Apagar o histórico guardado na conta? O que está neste aparelho continua.")) return; try{ await C.apagarDados(); toast("Dados da conta apagados"); }catch(e){ toast(e.message); } };
})();

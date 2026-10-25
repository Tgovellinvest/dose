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
window.CLOUD=C;

// ---------- UI: Mais → Conta ----------
window.V_conta=function(){ const u=C.user(); const last=S.cloud&&S.cloud.ultimoSync?new Date(S.cloud.ultimoSync):null;
  if(!u) return `<div class="card"><b>Sua conta, seus dados</b><p class="small">Sem conta o app funciona do mesmo jeito, só neste aparelho. Com conta, o histórico fica guardado e você abre no celular e no computador. Só e-mail e senha; nada de rede social.</p>
    <label>E-mail</label><input id="acEmail" type="email" autocomplete="email" placeholder="voce@exemplo.com"><label>Senha (mín. 8)</label><input id="acSenha" type="password" autocomplete="current-password" minlength="8">
    <div class="grid2" style="margin-top:10px"><button class="btn em" onclick="contaEntrar()">Entrar</button><button class="btn sec" onclick="contaCriar()">Criar conta</button></div>
    <button class="btn sm ghost" style="margin-top:8px" onclick="contaRecuperar()">Esqueci a senha</button>
    <p class="tiny" style="margin-top:10px">Guardamos só o que o app já guarda no aparelho (perfil, treinos, check-ins, diário). Nada é vendido nem compartilhado. Você apaga tudo quando quiser, aqui mesmo.</p><p class="tiny">Ao criar conta ou entrar, você concorda com os <a href="termos.html" target="_blank" rel="noopener">Termos de Uso</a> e a <a href="privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>.</p></div>`;
  return `<div class="card"><b>${esc(u.email)}</b><p class="small">Sincronização automática ligada. Último envio: ${last?last.toLocaleString('pt-BR'):"ainda não"}.</p>
    <div class="grid2" style="margin-top:10px"><button class="btn sec" onclick="contaSync('push')">Enviar agora</button><button class="btn sec" onclick="contaSync('pull')">Baixar da conta</button></div>
    <button class="btn ghost" style="margin-top:8px" onclick="contaSair()">Sair (os dados ficam no aparelho)</button></div>
    <div class="card"><b>Privacidade</b><p class="small">Apagar os dados da conta remove o histórico do servidor; o que está neste aparelho continua. Para encerrar a conta por completo, apague os dados e escreva para o e-mail de suporte indicado no site.</p><button class="btn danger sm" onclick="contaApagar()">Apagar meus dados da conta</button></div>`;
};
const v=id=>(document.getElementById(id)||{}).value||"";
window.contaEntrar=async()=>{ try{ await C.entrar(v('acEmail').trim(),v('acSenha')); const r=await C.primeiraSync(); if(r==="conflito") sheet(`<h3>Há dados nos dois lugares</h3><p class="small">Este aparelho e a conta têm histórico. Qual vale?</p><div class="col"><button class="btn em" onclick="closeSheet();contaSync('pull')">Usar os da conta (substitui este aparelho)</button><button class="btn sec" onclick="closeSheet();contaSync('push')">Usar os deste aparelho (substitui a conta)</button></div><p class="tiny">Antes de escolher, exporte um backup em Mais → Dados se tiver dúvida.</p>`); go('mais',{t:'conta'}); }catch(e){ toast(e.message); } };
window.contaCriar=async()=>{ const email=v('acEmail').trim(), senha=v('acSenha'); if(senha.length<8) return toast("Senha com pelo menos 8 caracteres"); try{ const r=await C.criar(email,senha); if(r.confirmar){ sheet(`<h3>Confirme o e-mail</h3><p class="small">Enviamos um link para <b>${esc(email)}</b>. Abra, confirme e volte aqui para entrar.</p>`); } else { await C.primeiraSync(); go('mais',{t:'conta'}); } }catch(e){ toast(e.message); } };
window.contaRecuperar=async()=>{ const email=v('acEmail').trim(); if(!email) return toast("Digite o e-mail"); try{ await C.recuperar(email); toast("Link de recuperação enviado"); }catch(e){ toast(e.message); } };
window.contaSair=async()=>{ await C.sair(); toast("Saiu da conta"); go('mais',{t:'conta'}); };
window.contaSync=async(dir)=>{ try{ if(dir==='push'){ await C.empurrar(); toast("Enviado"); } else { const row=await C.puxar(); if(!row) return toast("Nada na conta ainda"); C.aplicar(row.dados); toast("Carregado da conta"); } go('mais',{t:'conta'}); }catch(e){ toast(e.message); } };
window.contaApagar=async()=>{ if(!confirm("Apagar o histórico guardado na conta? O que está neste aparelho continua.")) return; try{ await C.apagarDados(); toast("Dados da conta apagados"); }catch(e){ toast(e.message); } };
})();

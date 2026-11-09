// ================= DOSE · v7.7 — treino no ponto e presença confirmada (Q1 e Q4, aprovados pelo Tiago em 09/11/2026) =================
// Q1: cada ponto do mapa tem "Marcar treino aqui", que abre o treino aberto com o local preenchido e liga o treino ao ponto.
//     O cartão do ponto mostra quantos treinos abertos ele tem nos próximos dias.
// Q4: depois do treino, quem organizou marca quem foi. Cada presença vale +5 pontos nos grupos (grupos.js) e conta para a medalha "Ponto".
(function(){
const V=window.VIEWS, A=window.AFTER;
const U=()=>window.CLOUD&&CLOUD.user();
const api=(p,o)=>window.GRUPOS.api(p,o);
const pontos=()=>window.DOSE_PONTOS||[];

// ---------- Q1 · marcar treino num ponto ----------
window.mpMarcar=async(i)=>{ const p=pontos()[i]; if(!p) return;
  if(!U()){ toast('Entre na sua conta para marcar treino'); return go('mais',{t:'conta'}); }
  let pf=null; try{ pf=await window.REGIAO.meuPerfil(true); }catch(e){}
  if(!pf||!pf.ativo){ toast('Ative seu perfil público para marcar treino com a comunidade'); return go('perfilpub'); }
  S.regiao=S.regiao||{}; if(!S.regiao.esp) S.regiao.esp='corrida'; window.rgNovo(); window._mpPonto=p.id; setTimeout(()=>{ const tp=document.getElementById('taP'); if(tp) tp.value=p.nome; },30); };
const _cr=window.rgCriar; if(_cr) window.rgCriar=async(...a)=>{ try{ return await _cr(...a); } finally { window._mpPonto=null; } };
const _cs=window.closeSheet; if(_cs) window.closeSheet=(...a)=>{ window._mpPonto=null; return _cs(...a); };

// contagem de treinos abertos por ponto (só com conta; a regra do banco mostra treinos dos últimos 2 dias em diante)
let contagem=null;
async function contar(){ if(!U()) return null; try{ const r=await api(`treinos_abertos?ponto_id=not.is.null&quando=gte.${new Date().toISOString()}&select=ponto_id&limit=500`); const c={}; (r||[]).forEach(x=>c[x.ponto_id]=(c[x.ponto_id]||0)+1); contagem=c; return c; }catch(e){ return null; } }
const _vm=V.comunidade_mapa; if(_vm) V.comunidade_mapa=(p)=>{ let h=_vm(p);
  return h.replace(/(<div class="mp4-cartao" data-i="(\d+)"[\s\S]*?)(<a class="lk")/g,(m,a,i,b)=>`${a}<div class="mp4-acoes"><button class="btn sm em" style="width:auto" onclick="event.stopPropagation();mpMarcar(${i})">Marcar treino aqui</button><span class="tiny mp4-n" data-p="${(pontos()[+i]||{}).id}"></span></div>${b}`); };
const _am=A.comunidade_mapa; A.comunidade_mapa=(p)=>{ if(_am) _am(p); contar().then(c=>{ if(!c) return; document.querySelectorAll('.mp4-n').forEach(el=>{ const n=c[el.dataset.p]||0; el.textContent=n?`${n} ${n===1?'treino marcado':'treinos marcados'}`:''; }); }); };

// ---------- Q4 · presença ----------
window.rgPresenca=async(id)=>{ try{
  const t=(await api(`treinos_abertos?id=eq.${id}&select=id,quando,ponto,criador,treino_participantes(user_id,status,presente)`))[0]; if(!t) return toast('Treino não encontrado');
  const conf=(t.treino_participantes||[]).filter(x=>x.status==='confirmado'); if(!conf.length) return toast('Ninguém confirmou nesse treino');
  const nm=await api(`perfis_publicos?user_id=in.(${conf.map(x=>x.user_id).join(',')})&select=user_id,apelido`).catch(()=>[]); const nome=u=>((nm||[]).find(x=>x.user_id===u)||{}).apelido||'Membro';
  window._rgPres={id,dia:new Date(t.quando).toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'}),sel:new Set(conf.filter(x=>x.presente).map(x=>x.user_id)),todos:conf.map(x=>x.user_id)};
  sheet(`<h3>Quem foi?</h3><p class="small">${esc(t.ponto)}. Marque quem apareceu. Cada presença vale 5 pontos nos grupos da pessoa e conta para a medalha Ponto.</p>
   <div class="chips" id="rgPresL">${conf.map(x=>`<button class="chip ${x.presente?'on':''}" onclick="this.classList.toggle('on');rgPresTroca('${x.user_id}',this.classList.contains('on'))">${esc(nome(x.user_id))}</button>`).join('')}</div>
   <button class="btn em" style="margin-top:12px" onclick="rgPresSalvar()">Salvar presença</button><p class="tiny" style="margin-top:8px">Só quem organizou marca. Dá para corrigir depois.</p>`);
 }catch(e){ toast(e.message||'Não consegui abrir agora'); } };
window.rgPresTroca=(u,on)=>{ const s=window._rgPres; if(!s) return; on?s.sel.add(u):s.sel.delete(u); };
window.rgPresSalvar=async()=>{ const s=window._rgPres; if(!s) return; try{
  for(const u of s.todos){ const on=s.sel.has(u); await api(`treino_participantes?treino_id=eq.${s.id}&user_id=eq.${u}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({presente:on,presente_em:on?s.dia:null})}); }
  closeSheet(); toast(`Presença salva · ${s.sel.size} ${s.sel.size===1?'pessoa':'pessoas'}`); if(window.GRUPOS&&GRUPOS.cache) GRUPOS.cache.detalhe={};
 }catch(e){ toast(e.message||'Não consegui salvar'); } };

// ---------- medalha "Ponto" (presenças confirmadas) ----------
async function sincPresencas(){ if(!U()) return; try{ const r=await api(`treino_participantes?user_id=eq.${U().id}&presente=eq.true&select=treino_id`); const n=(r||[]).length; if(S.presencasPonto!==n){ S.presencasPonto=n; save(); } }catch(e){} }
const _md=window.medalhas; if(_md) window.medalhas=function(){ const L=_md.apply(this,arguments); const v=S.presencasPonto||0; const t=[1,5,15]; const tier=v>=t[2]?3:v>=t[1]?2:v>=t[0]?1:0;
  L.push({cat:'Ponto',ico:'pin',nome:'Treinos da comunidade com presença confirmada',v,t,un:'treinos',tier,prox:t.find(x=>x>v)||null}); return L; };
const _ac=A.comunidade; A.comunidade=(p)=>{ const r=_ac?_ac(p):null; sincPresencas(); return r; };
setTimeout(sincPresencas,4000);
})();

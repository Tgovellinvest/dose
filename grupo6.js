// ================= DOSE · v8.0 — grupo de 6 montado pelo app (aprovado pelo Tiago em 09/11/2026, G1 a G4) =================
// G1: em Pontos, "Quero treinar com um grupo": a pessoa escolhe o ponto, o dia e o horário.
// G2: o app junta quem pediu o mesmo ponto e horário, no mesmo esporte e com nível igual ou vizinho. O ponto faz o papel do bairro.
// G3: o encontro fecha com 4 pessoas e vai até 6. Pedido feito com pelo menos 24 h; se não fechar até 24 h antes, não marca.
// G4: depois do encontro, se você tem "treinaria de novo" mútuo com 2 ou mais pessoas daquele treino, o app sugere virar grupo fixo.
// Por enquanto só corrida: os pontos do mapa são percursos de corrida. Outros esportes entram com as camadas por atividade.
// A montagem roda no banco (função quero_grupo), sem custo novo.
(function(){
const V=window.VIEWS, A=window.AFTER;
const U=()=>window.CLOUD&&CLOUD.user();
const rpc=(f,a)=>window.GRUPOS.rpc(f,a), api=(p,o)=>window.GRUPOS.api(p,o);
const pontos=()=>window.DOSE_PONTOS||[];
const HORAS=["06:00","08:00","18:00"];
const DS=["dom","seg","ter","qua","qui","sex","sáb"];
const hm=s=>{ const [a,b]=s.split(':').map(Number); return a*60+b; };
const cabe=(p,h)=>{ if(!p.h||p.h==='24h') return true; const m=p.h.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/); if(!m) return false; return hm(h)>=hm(m[1])&&hm(h)+60<=hm(m[2]); };
const isoRio=(dia,h)=>new Date(`${dia}T${h}:00-03:00`).toISOString(); // Rio sem horário de verão desde 2019
const diaRio=d=>d.toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
const quandoTxt=q=>{ const d=new Date(q); const dia=new Date(diaRio(d)+'T12:00:00'); const [h,m]=d.toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hour12:false}).split(':').map(Number); return `${DS[dia.getDay()]} ${String(dia.getDate()).padStart(2,'0')}/${String(dia.getMonth()+1).padStart(2,'0')}, ${m?`${h}h${String(m).padStart(2,'0')}`:`${h}h`}`; };

// ---------- cartão na aba Pontos ----------
const card=()=>`<div class="card g6"><div class="eyebrow" style="text-align:left">Grupo de até 6</div><b class="g6-t">Quero treinar com um grupo</b>
  <p class="small" style="margin:6px 0 10px">Você escolhe o ponto, o dia e o horário. O app junta quem pediu o mesmo, no seu nível. Fecha com 4 pessoas.</p>
  <button class="btn sm sec" onclick="g6Novo()">Escolher ponto e horário</button><div id="g6Lista"></div></div>`;
const _vc=V.comunidade; V.comunidade=(p)=>{ const h=_vc(p); const i=h.indexOf('<div id="comRegiao"'); return i>=0?h.slice(0,i)+card()+h.slice(i):h; };
const _ac=A.comunidade; A.comunidade=(p)=>{ const r=_ac?_ac(p):null; g6Lista(); return r; };

let esc6={p:0,dia:null,h:null};
window.g6Novo=()=>{ if(!U()) return garantirConta(g6Novo,'Para treinar com um grupo');
  const dias=[]; for(let i=2;i<=14;i++){ const d=new Date(Date.now()+i*864e5); dias.push(diaRio(d)); } esc6={p:esc6.p||0,dia:esc6.dia&&dias.includes(esc6.dia)?esc6.dia:dias[0],h:null};
  const desenha=()=>{ const P=pontos(); const p=P[esc6.p]; const hs=HORAS.filter(h=>cabe(p,h)); if(!hs.includes(esc6.h)) esc6.h=hs[0]||null;
    document.getElementById('sheetBody').innerHTML=`<h3>Treinar com um grupo</h3><p class="small">Corrida, por enquanto. Os outros esportes entram quando os pontos de cada atividade estiverem no mapa.</p>
     <label>Ponto</label><div class="chips g6-ch">${P.map((x,i)=>`<button class="chip ${i===esc6.p?'on':''}" onclick="g6Set('p',${i})">${esc(x.nome)}</button>`).join('')}</div>
     <label>Dia</label><div class="chips g6-ch">${dias.map(d=>{ const x=new Date(d+'T12:00:00'); return `<button class="chip ${d===esc6.dia?'on':''}" onclick="g6Set('dia','${d}')">${DS[x.getDay()]} ${x.getDate()}</button>`; }).join('')}</div>
     <label>Horário</label>${hs.length?`<div class="chips">${hs.map(h=>`<button class="chip ${h===esc6.h?'on':''}" onclick="g6Set('h','${h}')">${+h.slice(0,2)}h</button>`).join('')}</div>`:`<p class="small">Esse ponto não tem horário informado.</p>`}
     ${p.hf&&p.h!=='24h'?`<p class="tiny">Funciona das ${esc(p.h.replace('-',' às '))} (${esc(p.hf)}).</p>`:''}
     <button class="btn em" style="margin-top:14px" ${esc6.h?'':'disabled'} onclick="g6Pedir()">Entrar na lista</button><p class="tiny" style="margin-top:8px">Precisa do perfil público ativo. O grupo fecha com 4 pessoas; se não fechar até 24 horas antes, o app avisa e não marca.</p>`; };
  window.g6Set=(k,v)=>{ esc6[k]=v; desenha(); }; sheet(''); desenha(); };
window.g6Pedir=async()=>{ const p=pontos()[esc6.p]; try{ const r=(await rpc('quero_grupo',{p_esporte:'corrida',p_ponto_id:p.id,p_ponto:p.nome,p_quando:isoRio(esc6.dia,esc6.h)}))[0];
  closeSheet(); toast(r.status==='fechado'?`Grupo fechado · ${r.pessoas} pessoas`:`Você está na lista · ${r.pessoas} de 4`); g6Lista(); }
 catch(e){ toast(e.message||'Não consegui agora'); if(/perfil público/.test(e.message||'')) setTimeout(()=>go('perfilpub'),900); } };
async function g6Lista(){ const el=document.getElementById('g6Lista'); if(!el||!U()) return;
  try{ const L=await rpc('minhas_procuras',{})||[]; if(!L.length){ el.innerHTML=''; return; }
    el.innerHTML=`<div class="g6-l">${L.map(x=>{ const prazo=new Date(x.quando).getTime()-864e5<Date.now(); const st=x.treino_id?`Grupo fechado`:prazo?'Não fechou. Não marcamos.':`${x.esperando} de 4 na lista`;
      return `<div class="g6-i" data-id="${x.id}" role="button" tabindex="0"><div><b>${esc(x.ponto)}</b><span class="tiny">${quandoTxt(x.quando)} · ${st}</span></div>${x.treino_id?`<button class="lk" onclick="comAba('pontos');rgAbrirTreino('${x.treino_id}')">ver ›</button>`:`<button class="lk" onclick="g6Sair('${x.id}')">${prazo?'limpar':'sair'}</button>`}</div>`; }).join('')}</div>`; }catch(e){ el.innerHTML=''; } }
window.g6Sair=async(id)=>{ try{ await api(`procuras?id=eq.${id}`,{method:'DELETE'}); g6Lista(); }catch(e){ toast(e.message); } };

// ---------- G4 · virar grupo fixo ----------
const _enc=window.encontro; if(_enc) window.encontro=async(id)=>{ await _enc(id); if(!U()) return;
  try{ const t=(await api(`treinos_abertos?id=eq.${id}&select=criador,ponto,quando,treino_participantes(user_id,status)`))[0]; if(!t) return;
    const turma=new Set([t.criador,...(t.treino_participantes||[]).filter(x=>x.status==='confirmado').map(x=>x.user_id)]); turma.delete(U().id);
    const mut=(await rpc('contatos_mutuos',{}).catch(()=>[])||[]).filter(c=>turma.has(c.user_id)); if(mut.length<2) return;
    const box=document.querySelector('#sheet .grid2'); if(!box) return;
    const b=document.createElement('button'); b.className='btn sec'; b.style.marginTop='8px'; b.textContent='Virar grupo fixo';
    b.onclick=()=>{ closeSheet(); window.gpNovo(); setTimeout(()=>{ const n=document.getElementById('gpNome'); if(n) n.value=`${t.ponto} · ${quandoTxt(t.quando).split(', ')[1]}`.slice(0,40); },80); };
    box.insertAdjacentElement('afterend',b);
    const p=document.createElement('p'); p.className='tiny'; p.style.margin='6px 0 0'; p.textContent=`Você e ${mut.length} pessoas desse treino marcaram "treinaria de novo" entre si.`; b.insertAdjacentElement('afterend',p);
  }catch(e){} };
})();

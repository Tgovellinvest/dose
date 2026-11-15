// ================= DOSE · v8.14 — pausa sem perder a sequência (aprovada pelo Tiago em 15/11/2026) =================
// Regra (Q3, opção A): 1 pausa de até 7 dias por mês. Nas semanas da pausa, as "semanas seguidas na dose" esperam: nem contam, nem quebram.
// A pausa não soma pontos e não muda o ranking dos grupos. Fica no aparelho (S.pausas), vai junto no backup da conta.
// Fora desta versão: a sequência de dias seguidos dentro de um grupo (precisa de dado no servidor; depende de ok do Tiago).
(function(){
const ymd=d=>d.ymd?d.ymd():`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const add=(iso,n)=>{ const x=new Date(iso+'T12:00:00'); x.setDate(x.getDate()+n); return ymd(x); };
const br=iso=>iso.slice(8,10)+'/'+iso.slice(5,7);
const lista=()=>{ S.pausas=Array.isArray(S.pausas)?S.pausas:[]; return S.pausas; };
const ativa=()=>{ const t=today(); return lista().find(p=>p.fim>=p.ini&&p.ini<=t&&t<=p.fim)||null; };
const usadaNoMes=()=>{ const m=today().slice(0,7); return lista().find(p=>p.ini.slice(0,7)===m)||null; };
const noMesQueVem=()=>{ const t=today(); const d=new Date(t.slice(0,7)+'-01T12:00:00'); d.setMonth(d.getMonth()+1); return ymd(d); };
const pausada=k=>{ const fim=add(k,6); return lista().some(p=>p.fim>=p.ini&&p.ini<=fim&&p.fim>=k); };
window.pausaAtiva=ativa;

// semanas seguidas: igual à regra original (≥3 sessões por semana), com as semanas de pausa neutras
window.streakSemanas=function(){
  const datas=[...S.logs.map(l=>l.data),...S.bjj.map(b=>b.data),...S.cardio.map(c=>c.data)]; if(!datas.length) return 0;
  const sem=d=>{ const x=new Date(d+'T12:00:00'); x.setDate(x.getDate()-((x.getDay()+6)%7)); return ymd(x); };
  const cnt={}; datas.forEach(d=>{ cnt[sem(d)]=(cnt[sem(d)]||0)+1; });
  let s=0; let w=new Date(); w.setDate(w.getDate()-((w.getDay()+6)%7));
  for(let i=0;i<104;i++){ const k=ymd(w); if((cnt[k]||0)>=3) s++; else if(i>0&&!pausada(k)) break; w.setDate(w.getDate()-7); }
  return s; };

window.pausaAbrir=()=>{ const a=ativa(), u=usadaNoMes();
  if(a){ sheet(`<h3>Sequência em pausa</h3><p class="small">Até ${br(a.fim)}, suas semanas seguidas esperam por você. Quando voltar a treinar, ela continua de onde parou.</p><button class="btn sec" onclick="pausaEncerrar()">Encerrar a pausa agora</button><button class="btn ghost" style="margin-top:8px" onclick="closeSheet()">Fechar</button>`); return; }
  if(u){ sheet(`<h3>Pausa deste mês já usada</h3><p class="small">É uma pausa por mês, de até 7 dias. Ela volta a valer em ${br(noMesQueVem())}.</p><button class="btn ghost" onclick="closeSheet()">Entendi</button>`); return; }
  sheet(`<h3>Pausar a sequência</h3><p class="small">Viagem, doença, lesão ou uma semana puxada. Por 7 dias, suas semanas seguidas na dose esperam por você: não contam, mas também não se perdem.</p><p class="tiny">Uma pausa por mês. Não soma pontos e não muda o ranking dos grupos.</p><button class="btn em" style="margin-top:10px" onclick="pausaIniciar()">Pausar por 7 dias</button><button class="btn ghost" style="margin-top:8px" onclick="closeSheet()">Agora não</button>`); };
window.pausaIniciar=()=>{ if(ativa()||usadaNoMes()) return closeSheet(); const t=today(); lista().push({ini:t,fim:add(t,6)}); save(); closeSheet(); toast(`Sequência em pausa até ${br(add(t,6))}`); route(); };
window.pausaEncerrar=()=>{ const a=ativa(); if(!a) return closeSheet(); a.fim=add(today(),-1); save(); closeSheet(); toast('Pausa encerrada'); route(); };

// linha no cartão de membro (Comunidade), depois de desenhado
function linha(){ const c=document.getElementById('cmCard'); if(!c||c.querySelector('.cm-pausa')) return; const a=ativa();
  const el=document.createElement('div'); el.className='cm-pausa';
  el.innerHTML=a?`<span class="tiny">Em pausa até ${br(a.fim)}. A sequência espera por você.</span> <button class="lk" onclick="pausaAbrir()">Detalhes</button>`:`<button class="lk" onclick="pausaAbrir()">Pausar a sequência</button>`;
  const tg=document.getElementById('cmTg'); if(tg) tg.parentNode.insertBefore(el,tg); else c.appendChild(el); }
{ const A=window.AFTER; const _a=A&&A.comunidade; if(_a) A.comunidade=function(){ const r=_a.apply(this,arguments); try{ linha(); }catch(e){} return r; }; }
})();

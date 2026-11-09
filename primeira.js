// ================= DOSE · v8.2 — "Primeira dose" (aprovada pelo Tiago em 09/11/2026, Q1) =================
// O convite só se completa quando quem convidou e quem chegou treinam juntos (presença confirmada) em até 14 dias do aceite.
// Vira o cartão "Primeira dose · Nº 0137" com os dois nomes, o ponto e a data; medalhas Padrinho (quem convidou) e Primeira dose (quem chegou).
// Se não acontecer, o convite volta para a cota de quem convidou (regra no banco: criar_convite e _convite_conta).
// Sem ranking e sem contador público: só os dois veem.
(function(){
const V=window.VIEWS, A=window.AFTER;
const U=()=>window.CLOUD&&CLOUD.user();
const rpc=(f,a)=>window.GRUPOS.rpc(f,a);
const nr=n=>String(n||0).padStart(4,'0');
const dm=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
const primeiro=s=>String(s||'').trim().split(/\s+/)[0]||'';

async function sinc(){ if(!U()) return null; try{ const L=await rpc('minhas_primeiras_doses',{})||[]; S.primeiras=L; save(); return L; }catch(e){ return null; } }

// aviso no topo da Comunidade enquanto a primeira dose está em aberto
function aviso(){ const hoje=today(); const p=(S.primeiras||[]).find(x=>!x.primeira_dose_em&&x.prazo>=hoje); if(!p) return '';
  const quem=p.papel==='padrinho'?primeiro(p.para_nome):primeiro(p.de_nome);
  return `<div class="card pd-aviso"><div class="eyebrow" style="text-align:left">Primeira dose · Nº ${nr(p.numero)}</div><b>Treine com ${esc(quem)} até ${dm(p.prazo)}.</b><p class="small" style="margin:4px 0 10px">${p.papel==='padrinho'?'O convite se completa quando vocês dois treinam juntos. Marque num ponto e confirme a presença.':'Seu convite se completa no primeiro treino com quem te convidou.'}</p><button class="btn sm sec" onclick="comAba('pontos',document.querySelector('.com-abas button'))">Escolher um ponto</button></div>`; }
const _vc=V.comunidade; V.comunidade=(p)=>{ const h=_vc(p); const av=aviso(); if(!av) return h; const i=h.indexOf('<div class="seg com-abas"'); return i>=0?h.slice(0,i)+av+h.slice(i):h; };
const _ac=A.comunidade; A.comunidade=(p)=>{ const r=_ac?_ac(p):null; sinc().then(L=>{ if(!L) return; const novo=L.find(x=>x.primeira_dose_em&&!(S.pdVistas||[]).includes(x.numero)); if(novo) setTimeout(()=>window.pdCartao(novo.numero),900); }); return r; };

// cartão da primeira dose
let pc=null;
window.pdCartao=async(numero)=>{ const p=(S.primeiras||[]).find(x=>x.numero===numero&&x.primeira_dose_em); if(!p) return; S.pdVistas=[...new Set([...(S.pdVistas||[]),numero])]; save(); pc={p,fmt:'feed',blob:null};
  sheet(`<div class="eyebrow" style="text-align:left">Convite completo</div><h3 style="margin-top:2px">A primeira dose</h3>
   <div class="seg" style="margin:8px 0"><button class="on" onclick="pdFmt('feed',this)">Feed 4:5</button><button onclick="pdFmt('story',this)">Story 9:16</button></div>
   <div id="pdPrev" class="dd-prev" style="aspect-ratio:4/5"></div>
   <p class="small" style="margin-top:10px">${p.papel==='padrinho'?`Você ganhou a medalha Padrinho. ${esc(primeiro(p.para_nome))} ganhou a Primeira dose.`:`Você ganhou a medalha Primeira dose. ${esc(primeiro(p.de_nome))} ganhou a Padrinho.`}</p>
   <button class="btn em" style="margin-top:8px" onclick="pdPostar()">${I('share')} Postar</button><button class="btn sm ghost" style="margin-top:8px" onclick="closeSheet()">Agora não</button>`);
  pdRender(); };
const dados=p=>({eyebrow:`Primeira dose · Convite Nº ${nr(p.numero)}`,titulo:`${primeiro(p.de_nome)} e ${primeiro(p.para_nome)}`,big:{v:nr(p.numero),u:'convite'},ks:[...(p.ponto?[{v:p.ponto.length>11?p.ponto.split(' ')[0]:p.ponto,l:'ponto'}]:[]),{v:dm(p.primeira_dose_em),l:'primeiro treino juntos'}],frase:'A primeira dose. Juntos.',fonte:'Presença confirmada por quem organizou'});
async function pdRender(){ const c=await window.cartaoDose(pc.fmt,dados(pc.p)); const el=document.getElementById('pdPrev'); if(el){ el.innerHTML=''; const im=new Image(); im.alt='Cartão da primeira dose'; im.src=c.toDataURL('image/png'); el.appendChild(im); } pc.blob=await new Promise(r=>c.toBlob(r,'image/png')); }
window.pdFmt=(f,b)=>{ pc.fmt=f; b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); const el=document.getElementById('pdPrev'); if(el) el.style.aspectRatio=f==='story'?'9/16':'4/5'; pdRender(); };
window.pdPostar=async()=>{ try{ const file=new File([pc.blob],`dose-primeira-dose-${nr(pc.p.numero)}.png`,{type:'image/png'}); if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'DOSE',text:'Vida na dose.'}); closeSheet(); } else { const u=URL.createObjectURL(pc.blob); const a=document.createElement('a'); a.href=u; a.download=file.name; document.body.appendChild(a); a.click(); a.remove(); toast('Imagem salva'); } }catch(e){} };

// medalhas
const _md=window.medalhas; if(_md) window.medalhas=function(){ const L=_md.apply(this,arguments); const P=S.primeiras||[];
  const pad=P.filter(x=>x.papel==='padrinho'&&x.primeira_dose_em).length; const t=[1,3,10]; const tier=pad>=t[2]?3:pad>=t[1]?2:pad>=t[0]?1:0;
  L.push({cat:'Padrinho',ico:'users',nome:'Convites que viraram primeira dose',v:pad,t,un:'convites',tier,prox:t.find(x=>x>pad)||null});
  const novo=P.some(x=>x.papel==='novo'&&x.primeira_dose_em)?1:0;
  L.push({cat:'Primeira dose',ico:'pin',nome:'Primeiro treino com quem te convidou',v:novo,t:[1,1,1],un:'treino',tier:novo?1:0,prox:novo?null:1});
  return L; };
setTimeout(sinc,5000);
})();

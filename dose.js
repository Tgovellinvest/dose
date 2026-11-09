// ================= DOSE · v7.9 — "A dose do dia" (aprovada pelo Tiago em 09/11/2026: Q1 a Q4) =================
// Q1: ao salvar qualquer atividade, o cartão do esporte abre pronto. Uma pergunta: postar? ("Postar", "Postar no grupo", "Agora não").
// Q2: dados do relógio opcionais e editáveis (FC média e máxima, cadência, potência, calorias do relógio) mais o número de cada esporte.
//     Nada é inventado: campo vazio não aparece no cartão. Calorias sem relógio continuam como estimativa MET (Ainsworth 2011).
// Q3: um cartão por esporte (musculação, corrida, Hyrox, jiu-jítsu, natação, beach tennis/tênis) e um cartão geral para os outros.
// Cartão: grafite, número grande em Archivo Narrow, título em Archivo 900, curva do símbolo com o ponto ember, frase em Instrument Serif.
// Sem brilho nem gradiente. Desenhado no aparelho; nada sobe para servidor até a pessoa postar.
(function(){
const SH=window.SHARE; if(!SH) return;
const COR={g:"#0F1012",s1:"#17181B",s3:"#262930",ink:"#F2F1EC",bone:"#D8D2C2",mute:"#8E8B84",em:"#E4572E"};
const DIA=["dom","seg","ter","qua","qui","sex","sáb"];
const fData=s=>{ const d=new Date(s+"T12:00:00"); return `${DIA[d.getDay()]} ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; };
const f1=n=>String(Math.round(n*10)/10).replace('.',',');
const mmss=s=>{ s=Math.round(s); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return h?`${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`:`${m}:${String(x).padStart(2,'0')}`; };
const segs=v=>{ if(v==null||v==='') return null; v=String(v).trim(); if(/^\d+(\.\d+)?$/.test(v)) return parseFloat(v)*60; const p=v.split(':').map(Number); if(p.some(isNaN)) return null; return p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1]; };
const n0=v=>{ const x=(typeof num==='function'?num(v):parseFloat(String(v).replace(',','.'))); return x&&x>0?x:null; };

// ---------- qual esporte é o registro ----------
const CORRIDA=/corrida|trote|esteira|intervalado|z2|caminhada/i;
function esporteDe(tipo,a){ if(tipo==='sessao') return 'musc';
  if(tipo==='cardio'){ if(/nata/i.test(a.tipo)) return 'natacao'; if(/bike|ciclis/i.test(a.tipo)) return 'bike'; if(CORRIDA.test(a.tipo)) return 'corrida'; return 'cardio'; }
  const e=a.esporte||''; if(e==='hyrox'||/hyrox/i.test(a.tipo)) return 'hyrox'; if(e==='bjj'||(!e&&/treino|bjj|jiu/i.test(a.tipo))) return 'bjj'; if(e==='tenis'||/t[eê]nis/i.test(a.tipo)) return 'tenis'; if(e==='natacao') return 'natacao'; return 'outro'; }
const NOME={musc:"Musculação",corrida:"Corrida",natacao:"Natação",bike:"Bike",hyrox:"Hyrox",bjj:"Jiu-jítsu",tenis:"Beach tennis e tênis",cardio:"Cardio",outro:"Esporte"};
// campos editáveis por esporte (além dos do relógio)
const EXTRA={hyrox:[["tempo","Tempo final","mm:ss"],["estacoes","Estações feitas","de 8"]],bjj:[["rounds","Rounds","rolas"]],tenis:[["sets","Sets",""],["placar","Placar","6/4 3/6 10/8"]],natacao:[["metros","Metros",""]]};
const RELOGIO=e=>[["fcMed","FC média","bpm"],["fcMax","FC máxima","bpm"],...(e==='corrida'?[["cad","Cadência","passos/min"],["pot","Potência","W"]]:e==='bike'?[["pot","Potência","W"],["cad","Cadência","rpm"]]:[]),["kcal","Calorias do relógio","kcal"]];

// ---------- dados do cartão ----------
function dados(tipo,a){ const e=esporteDe(tipo,a); const r=a.rel||{}; const min=tipo==='sessao'?a.dur:a.min; const fc=r.fcMed||a.fc;
  const d={e,eyebrow:`${NOME[e]==='Esporte'?(a.tipo||'Esporte'):NOME[e]} · ${fData(a.data)}`,titulo:null,big:null,ks:[]};
  const kc=()=>{ if(r.kcal) d.ks.push({v:r.kcal,l:"kcal do relógio"}); else if(min&&SH.kcal) d.ks.push({v:"≈"+SH.kcal(tipo==='sessao'?'musc':e==='bjj'?'BJJ':e==='hyrox'?'Hyrox':e==='tenis'?'Tênis':(a.tipo||'Cardio'),min,a.dist),l:"kcal (estimativa)"}); };
  const fcs=()=>{ if(fc) d.ks.push({v:fc,l:"FC média"}); if(r.fcMax) d.ks.push({v:r.fcMax,l:"FC máxima"}); };
  const tempo=()=>{ if(min) d.ks.push({v:min+" min",l:"tempo"}); };
  if(e==='musc'){ const done=(a.sets||[]).filter(s=>s.done); const ton=done.reduce((x,s)=>x+(s.peso||0)*(s.reps||0),0); d.titulo=a.nome||"Treino de força";
    d.big=ton>0?(ton>=1000?{v:f1(ton/1000),u:"t movidas"}:{v:Math.round(ton),u:"kg movidos"}):{v:done.length,u:"séries"};
    if(ton>0) d.ks.push({v:done.length,l:"séries"}); d.ks.push({v:new Set(done.map(s=>s.ex)).size,l:"exercícios"}); tempo(); fcs(); kc(); }
  else if(e==='corrida'||e==='bike'||e==='cardio'){ d.titulo=a.titulo||(a.tipo!==NOME[e]?a.tipo:null);
    if(a.dist){ d.big={v:f1(a.dist),u:"km"}; tempo(); if(min&&e!=='bike'){ const p=min/a.dist; d.ks.push({v:`${Math.floor(p)}:${String(Math.round((p%1)*60)).padStart(2,'0')}`,l:"pace /km"}); } if(min&&e==='bike') d.ks.push({v:f1(a.dist/(min/60)),l:"km/h"}); }
    else d.big={v:min||0,u:"min"};
    fcs(); if(r.cad) d.ks.push({v:r.cad,l:e==='bike'?"cadência rpm":"cadência"}); if(r.pot) d.ks.push({v:r.pot+" W",l:"potência"}); kc(); }
  else if(e==='natacao'){ const m=r.metros||a.metros||(a.dist?Math.round(a.dist*1000):null); d.titulo=a.titulo||null;
    d.big=m?{v:m>=1000?f1(m/1000).replace(/,0$/,''):m,u:m>=1000?"km nadados":"metros"}:{v:min||0,u:"min"}; if(m) tempo(); if(m&&min){ const p=min*60/(m/100); d.ks.push({v:mmss(p),l:"ritmo /100 m"}); } fcs(); kc(); }
  else if(e==='hyrox'){ const t=r.tempo?segs(r.tempo):a.tempoProva; d.titulo=a.titulo||null;
    d.big=t?{v:mmss(t),u:"tempo final"}:{v:min||0,u:"min"}; if(r.estacoes) d.ks.push({v:`${r.estacoes}/8`,l:"estações"}); if(t) tempo(); fcs(); kc(); }
  else if(e==='bjj'){ d.titulo=a.titulo||null;
    d.big=r.rounds?{v:r.rounds,u:r.rounds==1?"round":"rounds"}:{v:min||0,u:"min de tatame"}; if(r.rounds) tempo(); if(a.intens) d.ks.push({v:({baixa:"leve",media:"média",alta:"forte"})[a.intens]||a.intens,l:"intensidade"}); fcs(); kc(); }
  else if(e==='tenis'){ d.titulo=a.titulo||null; const pl=r.placar||a.placar;
    d.big=r.sets?{v:r.sets,u:r.sets==1?"set":"sets"}:{v:min||0,u:"min de quadra"}; if(pl) d.ks.push({v:pl,l:"placar"}); if(r.sets) tempo(); fcs(); kc(); }
  else { d.titulo=a.titulo||null; d.big={v:min||0,u:"min"}; if(a.dist) d.ks.push({v:f1(a.dist)+" km",l:"distância"}); fcs(); kc(); }
  const it=a.intens||(a.rpe>=8?'alta':a.rpe&&a.rpe<=5?'baixa':null); d.frase=it==='alta'?"Dia forte. Na dose.":it==='baixa'?"Leve, de propósito. Na dose.":"Na dose.";
  if(a.fonte==='strava') d.fonte="Importado do Strava"; else if(a.rel&&Object.keys(a.rel).some(k=>['fcMed','fcMax','cad','pot','kcal'].includes(k)&&a.rel[k])) d.fonte="Dados do relógio digitados pelo membro";
  return d; }

// ---------- desenho ----------
const rr=(x,X,Y,W,H,r)=>{ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+W,Y,X+W,Y+H,r); x.arcTo(X+W,Y+H,X,Y+H,r); x.arcTo(X,Y+H,X,Y,r); x.arcTo(X,Y,X+W,Y,r); x.closePath(); };
const fontes=async()=>{ try{ await Promise.all(["900 100px Archivo","700 60px 'Archivo Narrow'","italic 48px 'Instrument Serif'","600 36px Archivo"].map(f=>document.fonts.load(f))); }catch(e){} };
function quebra(t,max){ const o=[]; let l=""; String(t).split(" ").forEach(w=>{ if((l+" "+w).trim().length>max&&l){ o.push(l); l=w; } else l=(l+" "+w).trim(); }); if(l) o.push(l); return o.slice(0,2); }
function curva(x,X,Y,W,H){ const P=u=>{ const p0=[0,.9],p1=[.28,.88],p2=[.38,.2],p3=[1,.12]; const a=(1-u)**3,b=3*(1-u)**2*u,c=3*(1-u)*u*u,d=u**3; return [X+W*(a*p0[0]+b*p1[0]+c*p2[0]+d*p3[0]),Y+H*(a*p0[1]+b*p1[1]+c*p2[1]+d*p3[1])]; };
  x.strokeStyle=COR.s3; x.lineWidth=6; x.lineCap="round"; x.beginPath(); for(let i=0;i<=60;i++){ const [px,py]=P(i/60); i?x.lineTo(px,py):x.moveTo(px,py); } x.stroke();
  const [dx,dy]=P(.62); x.fillStyle=COR.em; x.beginPath(); x.arc(dx,dy,16,0,Math.PI*2); x.fill(); }
window.cartaoDose=async function(fmt,d,foto){ await fontes(); const W=1080,H=fmt==='story'?1920:1350; const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
  x.fillStyle=COR.g; x.fillRect(0,0,W,H); const M=84; let y=fmt==='story'?250:96;
  x.textBaseline="alphabetic"; x.fillStyle=COR.ink; x.font="900 56px Archivo, Arial"; x.fillText("DOSE",M,y+50); x.fillStyle=COR.em; x.fillText(".",M+x.measureText("DOSE").width,y+50);
  if(foto){ const fy=y+100, fh=fmt==='story'?620:430; x.save(); rr(x,M,fy,W-2*M,fh,28); x.clip(); const k=Math.max((W-2*M)/foto.width,fh/foto.height); x.drawImage(foto,M+((W-2*M)-foto.width*k)/2,fy+(fh-foto.height*k)/2,foto.width*k,foto.height*k); x.restore(); y=fy+fh-20; }
  else { curva(x,W-M-330,y-6,330,150); y+=40; }
  y+=110; x.fillStyle=COR.mute; x.font="700 28px 'Archivo Narrow', Archivo, Arial"; x.fillText(d.eyebrow.toUpperCase().split("").join(String.fromCharCode(8202)),M,y);
  if(d.titulo){ y+=20; x.fillStyle=COR.ink; const sz=fmt==='story'?92:80; x.font=`900 ${sz}px Archivo, Arial`; quebra(d.titulo,16).forEach(l=>{ y+=sz*.95; x.fillText(l.toUpperCase(),M,y); }); }
  let BG=foto?(fmt==='story'?230:180):(fmt==='story'?280:240); const cabe=()=>{ x.font=`700 ${BG}px 'Archivo Narrow', Archivo, Arial`; const w1=x.measureText(String(d.big.v)).width; x.font=`700 ${Math.round(BG*.26)}px 'Archivo Narrow', Archivo, Arial`; return w1+10+x.measureText(d.big.u).width<=W-2*M; }; while(!cabe()&&BG>90) BG-=10;
  y+=BG*.95; x.fillStyle=COR.ink; x.font=`700 ${BG}px 'Archivo Narrow', Archivo, Arial`; x.fillText(String(d.big.v),M-6,y); const bw=x.measureText(String(d.big.v)).width;
  x.fillStyle=COR.bone; x.font=`700 ${Math.round(BG*.26)}px 'Archivo Narrow', Archivo, Arial`; x.fillText(d.big.u,M+bw+10,y);
  const ks=d.ks.slice(0,fmt==='story'?6:(foto?2:4)); const KH=fmt==='story'?190:150, gap=24, colW=(W-2*M-gap)/2; y+=50;
  ks.forEach((k,i)=>{ const X=M+(i%2)*(colW+gap), Y=y+Math.floor(i/2)*(KH+gap); x.fillStyle=COR.s1; rr(x,X,Y,colW,KH,24); x.fill(); x.fillStyle=COR.ink; x.font=`700 ${Math.round(KH*.46)}px 'Archivo Narrow', Archivo, Arial`; let v=String(k.v); while(x.measureText(v).width>colW-56&&v.length>3) v=v.slice(0,-1); x.fillText(v,X+30,Y+KH*.56); x.fillStyle=COR.mute; x.font="600 26px Archivo, Arial"; x.fillText(k.l,X+30,Y+KH*.84); });
  y+=Math.ceil(ks.length/2)*(KH+gap);
  const bot=fmt==='story'?H-220:H-70; const fy=Math.min(Math.max(y+70,bot-150),bot-90); x.fillStyle=COR.bone; x.font="italic 56px 'Instrument Serif', Georgia, serif"; x.fillText(d.frase,M,fy);
  if(d.fonte){ x.fillStyle=COR.mute; x.font="500 22px Archivo, Arial"; x.fillText(d.fonte,M,fy+40); }
  x.fillStyle=COR.mute; x.font="600 26px 'Archivo Narrow', Archivo, Arial"; x.fillText(SH.URL.toUpperCase(),M,bot); x.textAlign="right"; x.fillText("VIDA NA DOSE.",W-M,bot); x.textAlign="left";
  return c; };

// ---------- folha "A dose do dia" ----------
let cur=null;
const reg=(tipo,id)=>(tipo==='sessao'?S.logs:tipo==='cardio'?S.cardio:S.bjj).find(x=>x.id===id);
function campos(a,e){ const r=a.rel||{}; const inp=(k,l,ph)=>`<div><label for="dd_${k}">${l}</label><input id="dd_${k}" data-k="${k}" ${k==='tempo'||k==='placar'?'':'type="number" inputmode="numeric"'} value="${esc(r[k]??(k==='fcMed'&&a.fc?a.fc:k==='metros'&&a.metros?a.metros:''))}" placeholder="${esc(ph)}" onchange="ddCampo(this)"></div>`;
  const ex=EXTRA[e]||[]; const rel=RELOGIO(e);
  return `${ex.length?`<div class="grid2" style="margin-top:4px">${ex.map(f=>inp(...f)).join("")}</div>`:""}
   <details class="card sub" style="margin:10px 0 0;padding:10px 12px"><summary><b>Dados do relógio</b> <span class="tiny">· opcional, você corrige ou apaga</span></summary><div class="grid2" style="margin-top:6px">${rel.map(f=>inp(...f)).join("")}</div>
   <p class="tiny" style="margin:6px 0 0">Copie do seu relógio ou do app dele. Campo vazio não aparece no cartão.${a.fonte==='strava'?' FC e tempo vieram do Strava.':''}</p></details>`; }
SH.dose=async(tipo,id)=>{ const a=reg(tipo,id); if(!a) return; cur={tipo,id,fmt:(cur&&cur.fmt)||'feed',foto:null,blob:null}; const e=esporteDe(tipo,a);
  sheet(`<div class="eyebrow" style="text-align:left">${esc(NOME[e])}</div><h3 style="margin-top:2px">A dose do dia</h3>
   <div class="seg" style="margin:8px 0"><button class="${cur.fmt==='feed'?'on':''}" onclick="ddFmt('feed',this)">Feed 4:5</button><button class="${cur.fmt==='story'?'on':''}" onclick="ddFmt('story',this)">Story 9:16</button></div>
   <div id="ddPrev" class="dd-prev" style="aspect-ratio:${cur.fmt==='story'?'9/16':'4/5'}"></div>
   <div class="row" style="align-items:center;gap:10px;margin:10px 0 0"><label for="dd_min" style="margin:0;flex:none">Duração</label><input id="dd_min" data-k="min" type="number" inputmode="numeric" min="1" max="600" placeholder="min" value="${(tipo==='sessao'?a.dur:a.min)||''}" onchange="ddCampo(this)" style="max-width:110px;margin:0"><span class="tiny">min</span></div>
   ${campos(a,e)}
   <button class="btn em" style="margin-top:12px" onclick="ddPostar()">${I("share")} Postar</button>
   ${window.GRUPOS&&window.CLOUD&&CLOUD.user()?`<button class="btn sec" style="margin-top:8px" onclick="ddGrupo()">${I("users")} Postar no grupo</button>`:""}
   <div class="row" style="gap:8px;margin-top:8px"><button class="btn sm ghost" onclick="ddBaixar()">Baixar imagem</button><button class="btn sm ghost" onclick="closeSheet()">Agora não</button></div>`);
  await render(); };
async function render(){ if(!cur) return; const a=reg(cur.tipo,cur.id); if(!a) return; const c=await window.cartaoDose(cur.fmt,dados(cur.tipo,a),cur.foto);
  const el=document.getElementById('ddPrev'); if(el){ el.innerHTML=""; const im=new Image(); im.alt="Prévia do cartão"; im.src=c.toDataURL("image/png"); el.appendChild(im); }
  cur.blob=await new Promise(r=>c.toBlob(r,"image/png")); return cur.blob; }
window.ddFmt=(f,b)=>{ cur.fmt=f; b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); const el=document.getElementById('ddPrev'); if(el) el.style.aspectRatio=f==='story'?'9/16':'4/5'; render(); };
window.ddCampo=(inp)=>{ const a=reg(cur.tipo,cur.id); if(!a) return; const k=inp.dataset.k, raw=inp.value.trim();
  if(k==='min'){ const v=n0(raw); if(cur.tipo==='sessao') a.dur=v?Math.min(600,Math.round(v)):null; else a.min=v?Math.min(600,Math.round(v)):null; }
  else { a.rel=a.rel||{}; const txt=k==='tempo'||k==='placar'; const v=txt?(raw.slice(0,30)||null):n0(raw); if(v==null) delete a.rel[k]; else a.rel[k]=txt?v:Math.round(v); if(k==='fcMed'&&cur.tipo==='cardio') a.fc=a.rel.fcMed||null;
    if(k==='tempo'&&a.rel.tempo){ const t=segs(a.rel.tempo); if(t) a.tempoProva=t; } }
  save(); render(); };
const nome=()=>`dose-${today()}.png`;
window.ddPostar=async()=>{ try{ const blob=cur.blob||await render(); const file=new File([blob],nome(),{type:"image/png"}); if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:"DOSE",text:"Vida na dose."}); toast("Postado"); closeSheet(); } else { ddBaixar(); toast("Imagem salva. Poste de onde quiser"); } }catch(e){ if(e&&e.name!=="AbortError") toast("Não deu para postar; baixe a imagem"); } };
window.ddBaixar=async()=>{ const blob=cur.blob||await render(); const u=URL.createObjectURL(blob); const l=document.createElement('a'); l.href=u; l.download=nome(); document.body.appendChild(l); l.click(); l.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000); };
window.ddGrupo=()=>{ const a=reg(cur.tipo,cur.id); if(!a) return; const d=dados(cur.tipo,a); const tipo=cur.tipo==='sessao'||cur.tipo==='cardio'?cur.tipo:'esporte';
  window.gpPostarSheet(tipo,{titulo:d.titulo||NOME[d.e],linhas:[`${d.big.v} ${d.big.u}`,...d.ks.filter(k=>!/kcal/.test(k.l)).slice(0,2).map(k=>`${k.v} ${k.l}`)]}); };
window.DOSE_DIA={dados,esporteDe};

// ---------- abre sozinho ao salvar ----------
// sessão e cardio já abriam o compartilhar: agora abrem a dose do dia.
SH.sessao=id=>{ const l=S.logs.find(x=>x.id===id)||S.logs[S.logs.length-1]; if(l) SH.dose('sessao',l.id); };
SH.cardio=id=>{ const c=S.cardio.find(x=>x.id===id)||S.cardio[S.cardio.length-1]; if(c) SH.dose('cardio',c.id); };
SH.esporte=id=>{ const b=S.bjj.find(x=>x.id===id)||S.bjj[S.bjj.length-1]; if(b) SH.dose('esporte',b.id); };
// esporte avulso, plano por esporte e sessão avulsa do plano: abrem também
const depois=(fn)=>function(){ const ids=new Set([...(S.bjj||[]),...(S.cardio||[])].map(x=>x.id)); const r=fn.apply(this,arguments);
  const b=(S.bjj||[]).find(x=>!ids.has(x.id)), c=(S.cardio||[]).find(x=>!ids.has(x.id));
  if(b) setTimeout(()=>SH.dose('esporte',b.id),350); else if(c) setTimeout(()=>SH.dose('cardio',c.id),350); return r; };
['salvaEsporte','salvaPlano','salvaAvulsa','salvaBjj'].forEach(k=>{ if(typeof window[k]==='function') window[k]=depois(window[k]); });
})();

// ================= DOSE · cards para compartilhar (sessão, cardio, semana, mês, medalha, objetivo) =================
// Linguagem do Guia de Voz: registrado, não prometido. Número grande, motivo curto, sem hype.
// Tudo desenhado em canvas no aparelho; nada sobe para servidor. Feed 1080×1350 · Story 1080×1920.
(function(){
const SH={}; SH.URL="tgovellinvest.github.io/dose"; // trocar quando o domínio dose.app.br estiver no ar
const COR={g:"#0F1012",s1:"#17181B",ink:"#F2F1EC",bone:"#D8D2C2",mute:"#8E8B84",em:"#E4572E",ok:"#6FAE8A",ouro:"#D4A24C",prata:"#B9BCC4",bronze:"#B2683A"};
const DIA=["dom","seg","ter","qua","qui","sex","sáb"];
const fmtData=s=>{ const d=new Date(s+"T12:00:00"); return `${DIA[d.getDay()]} ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; };
// MET (Compendium of Physical Activities, Ainsworth 2011) — estimativa, nunca "gasto exato".
const MET={musc:5.0,"Z2 base":6.0,Caminhada:3.5,Corrida:9.8,Trote:7.0,Intervalado:11.0,Esteira:9.0,Bike:7.5,Natação:7.0,Remo:7.0,Elíptico:5.0,Escada:9.0,Futebol:7.0,Boxe:7.8,Hyrox:10.0,HIIT:8.0,CrossFit:8.0,Tênis:7.3,BJJ:10.3,Cardio:6.0};
SH.kcal=(tipo,min,km)=>{ const peso=S.perfil.peso||70; let met=MET[tipo]||6; if(/corrida|trote|esteira/i.test(tipo)&&km&&min){ const kmh=km/(min/60); met=kmh>=14?12.3:kmh>=12?11.0:kmh>=10?9.8:kmh>=8?8.3:7.0; } return Math.round(met*peso*(min/60)); };
const fontsOk=async()=>{ try{ await Promise.all(["900 100px Archivo","700 60px 'Archivo Narrow'","italic 48px 'Instrument Serif'","600 36px Archivo"].map(f=>document.fonts.load(f))); }catch(e){} };
const VARS={bg:"#0F1012",s1:"#17181B",s2:"#1E2024",s3:"#262930",line:"#272A2F",tx:"#F2F1EC",tx2:"#B8B6AE",tx3:"#8E8B84",bone:"#D8D2C2",ember:"#E4572E",ok:"#6FAE8A",warn:"#D9A066",stop:"#E07A6A",gold:"#C9A24A",silver:"#A8A9AD",bronze:"#9C6B3C"};
const svgImg=svg=>new Promise(res=>{ svg=svg.replace(/var\(--([a-z0-9-]+)\)/g,(m,k)=>VARS[k]||"#F2F1EC"); if(!/xmlns=/.test(svg)) svg=svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"'); const im=new Image(); im.onload=()=>res(im); im.onerror=()=>res(null); im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg); });
const rr=(x,X,Y,W,H,r)=>{ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+W,Y,X+W,Y+H,r); x.arcTo(X+W,Y+H,X,Y+H,r); x.arcTo(X,Y+H,X,Y,r); x.arcTo(X,Y,X+W,Y,r); x.closePath(); };

// Base: fundo, wordmark, rodapé. Devolve contexto e área útil.
function base(fmt){ const W=1080,H=fmt==='story'?1920:1350; const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
  x.fillStyle=COR.g; x.fillRect(0,0,W,H); const gr=x.createRadialGradient(W*0.85,0,0,W*0.85,0,W*0.9); gr.addColorStop(0,"rgba(228,87,46,.18)"); gr.addColorStop(1,"rgba(228,87,46,0)"); x.fillStyle=gr; x.fillRect(0,0,W,H);
  const top=fmt==='story'?250:84; x.fillStyle=COR.ink; x.font="900 56px Archivo, Arial"; x.textBaseline="alphabetic"; x.fillText("DOSE",84,top+50); x.fillStyle=COR.em; x.fillText(".",84+x.measureText("DOSE").width,top+50);
  const bot=fmt==='story'?H-220:H-70; x.fillStyle=COR.mute; x.font="600 26px 'Archivo Narrow', Archivo, Arial"; x.fillText(SH.URL.toUpperCase(),84,bot); x.textAlign="right"; x.fillText("REGISTRADO, NÃO PROMETIDO.",W-84,bot); x.textAlign="left";
  return {c,x,W,H,top:top+120,bot:bot-80}; }
const eyebrow=(x,t,y)=>{ x.fillStyle=COR.em; x.font="700 28px 'Archivo Narrow', Archivo, Arial"; x.fillText(t.toUpperCase().split("").join(String.fromCharCode(8202)),84,y); };
const big=(x,v,y,size=230)=>{ x.fillStyle=COR.ink; x.font=`700 ${size}px 'Archivo Narrow', Archivo, Arial`; x.fillText(String(v),78,y); return x.measureText(String(v)).width; };
const h1=(x,lines,y,size=96)=>{ x.fillStyle=COR.ink; x.font=`900 ${size}px Archivo, Arial`; lines.forEach((l,i)=>x.fillText(l.toUpperCase(),84,y+i*size*0.92)); return y+lines.length*size*0.92; };
const serif=(x,t,y,size=44,maxW=900)=>{ x.fillStyle=COR.bone; x.font=`italic ${size}px 'Instrument Serif', Georgia, serif`; const words=t.split(" "); let line="",yy=y; words.forEach(w=>{ const test=line?line+" "+w:w; if(x.measureText(test).width>maxW){ x.fillText(line,84,yy); yy+=size*1.18; line=w; } else line=test; }); x.fillText(line,84,yy); return yy+size*1.18; };
const fecho=(x,t,y,b,size=44)=>{ const yy=Math.min(y,b.bot-size*1.2*Math.ceil(t.length/36)-10); return serif(x,t,yy,size); };
// Grade de KPIs: [{v,l}] em 2 colunas
const kpis=(x,items,y,W,h=200)=>{ const colW=(W-168-40)/2, gap=30, f=h/200; items.forEach((k,i)=>{ const X=84+(i%2)*(colW+40), Y=y+Math.floor(i/2)*(h+gap); x.fillStyle=COR.s1; rr(x,X,Y,colW,h,24); x.fill(); x.fillStyle=COR.ink; x.font=`700 ${Math.round(92*f)}px 'Archivo Narrow', Archivo, Arial`; x.fillText(String(k.v),X+32,Y+112*f); x.fillStyle=COR.mute; x.font=`600 ${Math.round(28*Math.max(.85,f))}px Archivo, Arial`; x.fillText(k.l,X+32,Y+164*f); }); return y+Math.ceil(items.length/2)*(h+gap)-gap; };
const barra=(x,pct,y,W,cor)=>{ x.fillStyle=COR.s1; rr(x,84,y,W-168,22,11); x.fill(); x.fillStyle=cor||COR.em; rr(x,84,y,Math.max(22,(W-168)*Math.min(1,pct)),22,11); x.fill(); };

// ---------- Tipos ----------
SH.draw={};
SH.draw.sessao=async(fmt,log)=>{ const b=base(fmt),x=b.x; const done=log.sets.filter(s=>s.done); const ton=done.reduce((a,s)=>a+(s.peso||0)*(s.reps||0),0); const exs=new Set(done.map(s=>s.ex)).size;
  const semana=S.logs.filter(l=>l.data>=semanaIni()).length; const kcal=log.dur?SH.kcal("musc",log.dur):null;
  eyebrow(x,`Sessão · ${fmtData(log.data)}`,b.top); let y=h1(x,quebra(log.nome||"Treino",14),b.top+120,fmt==='story'?110:96);
  y=kpis(x,[{v:done.length,l:"séries feitas"},{v:exs,l:"exercícios"},{v:ton>=1000?(Math.round(ton/100)/10).toFixed(1).replace('.',',')+" t":Math.round(ton)+" kg",l:"carga movida"},{v:log.dur?log.dur+" min":"—",l:"duração"}],y+40,b.W);
  if(kcal){ x.fillStyle=COR.mute; x.font="600 28px Archivo, Arial"; x.fillText(`≈ ${kcal} kcal (estimativa MET, Ainsworth 2011)`,84,y+30); }
  fecho(x,`${semana}ª sessão de força da semana. ${log.rpe>=8?"Pesada.":log.rpe<=5?"Leve, de propósito.":"Na dose."}`,y+(kcal?110:60),b); return b.c; };
SH.draw.cardio=async(fmt,c)=>{ const b=base(fmt),x=b.x; const BG=fmt==='story'?260:220, KH=fmt==='story'?200:150; const pace=c.dist&&c.min?c.min/c.dist:null; const kcal=c.min?SH.kcal(c.tipo,c.min,c.dist):null;
  eyebrow(x,`${c.tipo} · ${fmtData(c.data)}`,b.top); let y=b.top+120; if(c.dist){ const w=big(x,String(c.dist).replace('.',','),y+200,BG); x.fillStyle=COR.bone; x.font="700 64px 'Archivo Narrow', Archivo, Arial"; x.fillText("km",88+w,y+200); y+=210; } else { const w=big(x,c.min||0,y+200,BG); x.fillStyle=COR.bone; x.font="700 64px 'Archivo Narrow', Archivo, Arial"; x.fillText("min",88+w,y+200); y+=210; }
  const ks=[]; if(c.dist) ks.push({v:(c.min||0)+" min",l:"tempo"}); if(pace){ const m=Math.floor(pace),s=Math.round((pace-m)*60); ks.push({v:`${m}:${String(s).padStart(2,'0')}`,l:"pace /km"}); } if(c.fc) ks.push({v:c.fc+" bpm",l:"FC média"}); if(c.rpe) ks.push({v:c.rpe+"/10",l:"esforço"}); if(kcal) ks.push({v:"≈"+kcal,l:"kcal (estimativa)"});
  y=kpis(x,ks.slice(0,4),y+60,b.W,KH);
  fecho(x,(c.notas?c.notas.charAt(0).toUpperCase()+c.notas.slice(1).replace(/\.?$/,'. '):'')+(c.fonte==='strava'?"Importado do Strava. Contado na semana.":"Registrado. Contado na semana."),y+70,b,40); return b.c; };
function periodo(ini,fim){ const L=S.logs.filter(l=>l.data>=ini&&l.data<=fim), B=S.bjj.filter(l=>l.data>=ini&&l.data<=fim), C=S.cardio.filter(l=>l.data>=ini&&l.data<=fim);
  const series=L.reduce((a,l)=>a+l.sets.filter(s=>s.done).length,0), ton=L.reduce((a,l)=>a+l.sets.filter(s=>s.done).reduce((b,s)=>b+(s.peso||0)*(s.reps||0),0),0), km=C.reduce((a,c)=>a+(c.dist||0),0), min=C.reduce((a,c)=>a+(c.min||0),0)+B.reduce((a,c)=>a+(c.min||0),0);
  const kcal=L.reduce((a,l)=>a+(l.dur?SH.kcal("musc",l.dur):0),0)+C.reduce((a,c)=>a+(c.min?SH.kcal(c.tipo,c.min,c.dist):0),0)+B.reduce((a,c)=>a+(c.min?SH.kcal("BJJ",c.min):0),0);
  const dias=new Set([...L,...B,...C].map(z=>z.data)).size; return {L,B,C,series,ton,km,min,kcal,dias,sessoes:L.length+B.length+C.length}; }
SH.draw.semana=async(fmt)=>{ const b=base(fmt),x=b.x; const ini=semanaIni(); const p=periodo(ini,"9999"); const d=new Date(ini+"T12:00:00"); const BG=fmt==='story'?260:220, KH=fmt==='story'?200:150;
  eyebrow(x,`Semana de ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`,b.top); let y=b.top+120; const w=big(x,p.sessoes,y+200,BG); x.fillStyle=COR.bone; x.font="700 56px 'Archivo Narrow', Archivo, Arial"; x.fillText(p.sessoes===1?"treino":"treinos",88+w,y+200); y+=200;
  const ks=[{v:p.series,l:"séries"},{v:p.ton>=1000?(Math.round(p.ton/100)/10).toFixed(1).replace('.',',')+" t":Math.round(p.ton)+" kg",l:"carga movida"}]; if(p.km) ks.push({v:(Math.round(p.km*10)/10).toString().replace('.',','),l:"km"}); if(p.min) ks.push({v:p.min+" min",l:"cardio e esporte"}); if(p.kcal) ks.push({v:"≈"+p.kcal,l:"kcal (estimativa)"}); if(p.B.length) ks.push({v:p.B.length,l:"tatame"});
  y=kpis(x,ks.slice(0,fmt==='story'?6:4),y+60,b.W,KH); const alvo=(S.perfil.diasMusc||[]).length+Object.values(S.perfil.esportes||{}).reduce((a,v)=>a+(v||[]).length,0);
  if(alvo){ barra(x,p.dias/alvo,y+50,b.W,p.dias>=alvo?COR.ok:COR.em); x.fillStyle=COR.mute; x.font="600 28px Archivo, Arial"; x.fillText(`${p.dias} de ${alvo} dias planejados`,84,y+115); y+=130; }
  fecho(x,p.dias>=alvo&&alvo?"Semana cumprida. Dose certa.":p.sessoes?"Semana em andamento. O que foi feito, conta.":"Semana começando.",y+70,b); return b.c; };
SH.draw.mes=async(fmt)=>{ const b=base(fmt),x=b.x; const t=today(); const ini=t.slice(0,8)+"01"; const p=periodo(ini,t); const d=new Date(ini+"T12:00:00"); const BG=fmt==='story'?260:220, KH=fmt==='story'?200:150; const MES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  eyebrow(x,`${MES[d.getMonth()]} ${d.getFullYear()}`,b.top); let y=b.top+120; const w=big(x,p.dias,y+200,BG); x.fillStyle=COR.bone; x.font="700 56px 'Archivo Narrow', Archivo, Arial"; x.fillText("dias ativos",88+w,y+200); y+=200;
  const ks=[{v:p.sessoes,l:"treinos"},{v:p.series,l:"séries"}]; if(p.km) ks.push({v:(Math.round(p.km*10)/10).toString().replace('.',','),l:"km"}); if(p.ton) ks.push({v:p.ton>=1000?(Math.round(p.ton/100)/10).toFixed(1).replace('.',',')+" t":Math.round(p.ton)+" kg",l:"carga movida"}); if(p.kcal) ks.push({v:"≈"+(p.kcal>=10000?Math.round(p.kcal/1000)+"k":p.kcal),l:"kcal (estimativa)"}); if(p.min) ks.push({v:p.min+" min",l:"cardio e esporte"});
  y=kpis(x,ks.slice(0,fmt==='story'?6:4),y+60,b.W,KH); fecho(x,`${streakSemanas()} semana${streakSemanas()===1?"":"s"} seguida${streakSemanas()===1?"":"s"} com 3 ou mais treinos.`,y+70,b); return b.c; };
SH.draw.medalha=async(fmt,m)=>{ const b=base(fmt),x=b.x; eyebrow(x,`Medalha · ${m.cat}`,b.top); const im=await svgImg(medalSVG(m.ico,m.tier,400)); const cy=fmt==='story'?b.top+560:b.top+340; if(im) x.drawImage(im,b.W/2-200,cy-200,400,400);
  const corT={1:COR.bronze,2:COR.prata,3:COR.ouro}[m.tier]||COR.bone; x.textAlign="center"; x.fillStyle=corT; x.font="700 40px 'Archivo Narrow', Archivo, Arial"; x.fillText(TIER[m.tier].toUpperCase(),b.W/2,cy+280); x.fillStyle=COR.ink; x.font="900 72px Archivo, Arial"; quebra(m.nome,18).forEach((l,i)=>x.fillText(l.toUpperCase(),b.W/2,cy+380+i*70)); x.fillStyle=COR.mute; x.font="600 32px Archivo, Arial"; x.fillText(`${m.v} ${m.un}`,b.W/2,cy+380+quebra(m.nome,18).length*70+20); x.textAlign="left";
  fecho(x,m.tier===3?"Ouro. Ninguém dá; a gente registra.":"Conquistada aparecendo, não postando.",b.bot-60,b); return b.c; };
SH.draw.objetivo=async(fmt)=>{ const b=base(fmt),x=b.x; const p=S.perfil; const pes=(S.pesagens||[]).slice().sort((a,c)=>a.data.localeCompare(c.data)); const atual=pes.length?pes[pes.length-1].peso:p.peso; const ini=pes.length?pes[0].peso:p.peso; const alvo=p.pesoAlvo;
  eyebrow(x,"Objetivo",b.top); let y=b.top+120;
  if(alvo&&ini!=null&&atual!=null&&ini!==alvo){ const pct=Math.max(0,Math.min(1,(ini-atual)/(ini-alvo))); const feito=pct>=1||(ini>alvo?atual<=alvo:atual>=alvo);
    if(feito){ y=h1(x,["Objetivo","conquistado."],y+100,110); } else { const w=big(x,Math.round(pct*100),y+200,260); x.fillStyle=COR.bone; x.font="700 72px 'Archivo Narrow', Archivo, Arial"; x.fillText("%",88+w,y+200); y+=210; x.fillStyle=COR.mute; x.font="600 32px Archivo, Arial"; x.fillText("do caminho até a meta",84,y+40); y+=60; }
    barra(x,pct,y+40,b.W,feito?COR.ok:COR.em); y=kpis(x,[{v:String(ini).replace('.',','),l:"kg no início"},{v:String(atual).replace('.',','),l:"kg hoje"},{v:String(alvo).replace('.',','),l:"kg meta"},{v:pes.length,l:"pesagens"}],y+110,b.W,fmt==='story'?200:150);
    fecho(x,feito?"Agora a dose é manter.":"Tendência de 7 dias, não o número do dia.",y+70,b); }
  else { y=h1(x,["Meta ainda","não definida."],y+100,96); serif(x,"Em Perfil → Metas você escolhe peso-alvo e % de gordura. O card passa a mostrar o caminho.",y+60,40); }
  return b.c; };
function quebra(t,max){ const out=[]; let l=""; String(t).split(" ").forEach(w=>{ if((l+" "+w).trim().length>max&&l){ out.push(l); l=w; } else l=(l+" "+w).trim(); }); if(l) out.push(l); return out.slice(0,3); }

// ---------- UI: sheet com prévia, formato e compartilhar ----------
let cur={tipo:null,arg:null,fmt:'feed',blob:null};
SH.abrir=async(tipo,arg)=>{ cur={tipo,arg,fmt:cur.fmt||'feed',blob:null};
  sheet(`<h3>Compartilhar</h3><p class="small">Gerado no seu aparelho. Nada sobe para servidor até você escolher onde postar.</p>
   <div class="seg" style="margin:8px 0"><button class="${cur.fmt==='feed'?'on':''}" onclick="SHARE.fmt('feed')">Feed 4:5</button><button class="${cur.fmt==='story'?'on':''}" onclick="SHARE.fmt('story')">Story 9:16</button></div>
   <div id="shPrev" style="border-radius:16px;overflow:hidden;background:#000;aspect-ratio:${cur.fmt==='story'?'9/16':'4/5'};max-height:52dvh;margin:0 auto"></div>
   <div class="grid2" style="margin-top:12px"><button class="btn em" onclick="SHARE.compartilhar()">${I("share")} Compartilhar</button><button class="btn sec" onclick="SHARE.baixar()">Baixar PNG</button></div>
   ${window.GRUPOS&&window.CLOUD&&CLOUD.user()?`<button class="btn sec" style="margin-top:8px" onclick="SHARE.postarGrupo()">${I("users")} Postar no grupo</button>`:""}
   <button class="btn sm ghost" style="margin-top:8px" onclick="closeSheet()">Agora não</button>`);
  await SH.render(); };
SH.fmt=async f=>{ cur.fmt=f; await SH.abrir(cur.tipo,cur.arg); };
SH.render=async()=>{ await fontsOk(); const c=await SH.draw[cur.tipo](cur.fmt,cur.arg); const el=document.getElementById('shPrev'); if(el){ el.innerHTML=""; const im=new Image(); im.style.cssText="width:100%;height:100%;object-fit:contain;display:block"; im.src=c.toDataURL("image/png"); el.appendChild(im); }
  cur.blob=await new Promise(r=>c.toBlob(r,"image/png")); return cur.blob; };
const nome=()=>`dose-${cur.tipo}-${today()}.png`;
SH.compartilhar=async()=>{ try{ const blob=cur.blob||await SH.render(); const file=new File([blob],nome(),{type:"image/png"}); if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:"DOSE",text:"A dose certa. "+SH.URL}); toast("Compartilhado"); } else { SH.baixar(); toast("Imagem baixada: poste de onde quiser"); } }catch(e){ if(e&&e.name!=="AbortError") toast("Não deu para compartilhar; baixe o PNG"); } };
SH.baixar=async()=>{ const blob=cur.blob||await SH.render(); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=nome(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),4000); };
// Resumo em texto (sem dados sensíveis) para o feed do grupo
SH.resumo=()=>{ const t=cur.tipo,a=cur.arg; const f1=n=>String(Math.round(n*10)/10).replace('.',',');
  if(t==='sessao'){ const done=a.sets.filter(s=>s.done); const ton=done.reduce((x,s)=>x+(s.peso||0)*(s.reps||0),0); return {titulo:a.nome||"Treino de força",linhas:[`${done.length} séries`,ton>=1000?`${f1(ton/1000)} t`:`${Math.round(ton)} kg`,a.dur?`${a.dur} min`:null].filter(Boolean)}; }
  if(t==='cardio'){ return {titulo:a.tipo,linhas:[a.dist?`${f1(a.dist)} km`:null,a.min?`${a.min} min`:null,a.dist&&a.min?`${Math.floor(a.min/a.dist)}:${String(Math.round((a.min/a.dist%1)*60)).padStart(2,'0')} /km`:null].filter(Boolean)}; }
  if(t==='medalha') return {titulo:`Medalha · ${a.nome}`,linhas:[TIER[a.tier],`${a.v} ${a.un}`]};
  if(t==='semana'){ const ini=semanaIni(); const L=S.logs.filter(l=>l.data>=ini).length+S.bjj.filter(l=>l.data>=ini).length+S.cardio.filter(l=>l.data>=ini).length; return {titulo:"Semana",linhas:[`${L} treinos`]}; }
  if(t==='mes'){ const ini=today().slice(0,8)+"01"; const d=new Set([...S.logs,...S.bjj,...S.cardio].filter(l=>l.data>=ini).map(l=>l.data)).size; return {titulo:"Mês",linhas:[`${d} dias ativos`]}; }
  if(t==='objetivo'){ const p=S.perfil; const pes=(S.pesagens||[]); const atual=pes.length?pes[pes.length-1].peso:p.peso, ini=pes.length?pes[0].peso:p.peso; const pct=p.pesoAlvo&&ini!==p.pesoAlvo?Math.round(Math.max(0,Math.min(1,(ini-atual)/(ini-p.pesoAlvo)))*100):null; return {titulo:"Objetivo",linhas:[pct!=null?`${pct}% do caminho`:"meta não definida"]}; }
  return {titulo:t,linhas:[]}; };
SH.postarGrupo=()=>{ const r=SH.resumo(); window.gpPostarSheet(cur.tipo,r); };
// Atalhos
SH.sessao=id=>{ const l=S.logs.find(x=>x.id===id)||S.logs[S.logs.length-1]; if(l) SH.abrir('sessao',l); };
SH.cardio=id=>{ const c=S.cardio.find(x=>x.id===id)||S.cardio[S.cardio.length-1]; if(c) SH.abrir('cardio',c); };
SH.medalha=i=>{ const m=medalhas()[i]; if(m&&m.tier) SH.abrir('medalha',m); else toast("Conquiste primeiro. Depois conte."); };
window.SHARE=SH;
// Card da semana antigo agora abre o novo fluxo
window.cardSemana=()=>SH.abrir('semana');
})();

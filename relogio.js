// ================= DOSE · v8.8 — "Ler do print" na dose do dia (aprovado pelo Tiago em 09/11/2026, Q3) =================
// Lê o print do resumo do treino (Apple Watch, Garmin ou outro app) no próprio aparelho, sem servidor e sem custo:
// Tesseract.js 5.1.1 (Apache-2.0) com o modelo de português, servidos pelo site em vendor/ocr/ e baixados só quando a pessoa usa (~5 MB).
// Os campos lidos entram nos mesmos campos editáveis da dose do dia; a pessoa confere e corrige antes de postar.
// v8.17: foto do relógio no pulso (fundo, ângulo): recorta o texto claro sobre fundo escuro antes de ler; várias fotos somam campos; kcal = calorias ativas.
// Testado com 3 fotos reais do Apple Watch do Tiago (17/11/2026), não com outros modelos.
(function(){
const SH=window.SHARE; if(!SH||!SH.dose) return;
// Lê o texto de um print de resumo de treino e devolve os campos da dose do dia.
// Pela unidade (BPM, KM, CAL, PPM, W, h:mm:ss) e, quando falta unidade, pelo rótulo.
window.lerResumo=function(txt){
  const t=String(txt||'').replace(/[’'´`]/g,"'").replace(/[“”″]/g,'"').replace(/\r/g,'');
  const T=t.toLowerCase();
  const num=s=>parseFloat(String(s).replace(/\s/g,'').replace(',','.'));
  const out={};
  // tempo: h:mm:ss ou mm:ss (o primeiro que aparecer perto de "tempo" ou "duração"; senão o primeiro do texto)
  const tempos=[...T.matchAll(/\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g)].filter(m=>!/\d{1,2}:\d{2}\s*[–-]\s*\d/.test(T.slice(m.index,m.index+12)));
  const perto=tempos.find(m=>/tempo|dura[cç]/.test(T.slice(Math.max(0,m.index-60),m.index)))||tempos.find(m=>m[3]!==undefined)||null;
  if(perto){ const a=+perto[1],b=+perto[2],c=perto[3]!==undefined?+perto[3]:null; const min=c!==null?a*60+b+c/60:a+b/60; if(min>0&&min<600) out.min=Math.round(min); }
  const km=T.match(/(\d+[.,]\d+|\d+)\s*km\b(?!\s*\/\s*h)/); if(km){ const v=num(km[1]); if(v>0&&v<400) out.km=v; }
  // FC: primeiro pelo rótulo da linha (mais seguro), depois pela unidade, tolerando erros comuns de leitura ("bom", "bprn")
  const FC=/(?:\bfc\b|frequ[eê]ncia card[ií]aca|batimentos)/, N=l=>{ const m=l.match(/\b(\d{2,3})\b(?![.,:]\d)/); const v=m?+m[1]:null; return v&&v>=40&&v<=230?v:null; };
  T.split('\n').forEach(l=>{ if(!FC.test(l)) return; if(/m[aá]x/.test(l)){ const v=N(l.replace(/^[^\d]*?m[aá]x\w*/,'')); if(v&&out.fcMax==null) out.fcMax=v; } else if(/m[eé]d/.test(l)){ const v=N(l.replace(/^[^\d]*?m[eé]di\w*/,'')); if(v&&out.fcMed==null) out.fcMed=v; } });
  { const ir=T.match(/(\d{2,3})\s*[-–]\s*(\d{2,3})\s*(?:bpm|bom|b0m|bprn|8pm)\b/); if(ir){ const a=+ir[1],b2=+ir[2]; if(a>=40&&b2<=230&&b2>a&&out.fcMax==null) out.fcMax=b2; } }
  const bpm=[...T.matchAll(/(\d{2,3})\s*(?:bpm|bom|b0m|bprn|8pm)\b/g)].map(m=>+m[1]).filter(v=>v>=40&&v<=230);
  if(out.fcMed==null&&bpm.length) out.fcMed=bpm.length>1?Math.min(...bpm):bpm[0];
  if(out.fcMax==null&&bpm.length>1) out.fcMax=Math.max(...bpm);
  const ca=T.match(/calorias\s+ativas\D{0,30}?(\d{2,4})|(\d{2,4})\s*(?:k?cal)\b/); const cl=T.match(/calorias\D{0,20}?(\d{2,4})/);
  const kcalA=[...T.matchAll(/(\d{2,4})\s*k?cal\b/g)].map(m=>+m[1]);
  const ativ=T.match(/calorias\s+ativas[^\d]{0,40}?(\d{2,4})(?![\d:])/); const kA=ativ?+ativ[1]:null;
  if(kA&&kA>=20&&kA<=3000) out.kcal=kA; else if(kcalA.length) out.kcal=Math.min(...kcalA); else if(cl) out.kcal=+cl[1];
  const cad=T.match(/(\d{2,3})\s*(?:ppm|spm|rpm)\b/)||T.match(/cad[eê]ncia[^\n\d]{0,30}(\d{2,3})/); if(cad) out.cad=+cad[1];
  const pot=T.match(/(\d{2,4})\s*w\b/)||T.match(/pot[eê]ncia[^\n\d]{0,20}(\d{2,4})/); if(pot) out.pot=+pot[1];
  return out; }
let carga=null;
function lib(){ if(window.Tesseract) return Promise.resolve(); if(carga) return carga; carga=new Promise((ok,erro)=>{ const s=document.createElement('script'); s.src='vendor/ocr/tesseract.min.js'; s.onload=ok; s.onerror=()=>{ carga=null; erro(new Error('Sem internet para carregar a leitura')); }; document.head.appendChild(s); }); return carga; }
// pré-processamento de foto do relógio no pulso: acha o texto claro sobre fundo escuro, recorta e limpa o fundo
// pré-processa foto de relógio: acha a área do texto claro sobre fundo escuro, recorta, usa o canal mais claro e inverte
window.prepRelogio=async function(blob,debug){
  const bm=await createImageBitmap(blob,{imageOrientation:'from-image'}); const W=bm.width,H=bm.height;
  const sc=Math.min(1,400/Math.max(W,H)); const sw=Math.max(1,Math.round(W*sc)), sh=Math.max(1,Math.round(H*sc));
  const c=document.createElement('canvas'); c.width=sw; c.height=sh; const x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(bm,0,0,sw,sh);
  const d=x.getImageData(0,0,sw,sh).data; const V=new Uint8Array(sw*sh); for(let i=0;i<sw*sh;i++) V[i]=Math.max(d[i*4],d[i*4+1],d[i*4+2]);
  // pixel de texto = claro com pixel bem escuro por perto (7x7)
  const txt=new Uint8Array(sw*sh); for(let y=3;y<sh-3;y++) for(let xx=3;xx<sw-3;xx++){ const i=y*sw+xx; if(V[i]<140) continue; let esc=false; for(let dy=-3;dy<=3&&!esc;dy++) for(let dx=-3;dx<=3;dx++){ if(V[i+dy*sw+dx]<35){ esc=true; break; } } if(esc) txt[i]=1; }
  const cs=8, gw=Math.ceil(sw/cs), gh=Math.ceil(sh/cs); const g=new Uint8Array(gw*gh);
  for(let y=0;y<sh;y++) for(let xx=0;xx<sw;xx++) if(txt[y*sw+xx]) g[((y/cs)|0)*gw+((xx/cs)|0)]++;
  const on=new Uint8Array(gw*gh); for(let i=0;i<gw*gh;i++) on[i]=g[i]>=5?1:0;
  const lab=new Int32Array(gw*gh); let best=null,n=0; const st=[];
  for(let i=0;i<gw*gh;i++){ if(!on[i]||lab[i]) continue; n++; let a=0,x0=gw,y0=gh,x1=0,y1=0; st.push(i); lab[i]=n;
    while(st.length){ const j=st.pop(); a+=g[j]; const px=j%gw,py=(j/gw)|0; if(px<x0)x0=px; if(px>x1)x1=px; if(py<y0)y0=py; if(py>y1)y1=py;
      for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++){ const nx=px+dx,ny=py+dy; if(nx<0||ny<0||nx>=gw||ny>=gh) continue; const k=ny*gw+nx; if(on[k]&&!lab[k]){ lab[k]=n; st.push(k); } } }
    if(!best||a>best.a) best={a,x0,y0,x1,y1}; }
  let cx=0,cy=0,cw=W,ch=H; if(best&&best.a>=40){ const pad=1.2; const bx0=(best.x0-pad)*cs/sc, by0=(best.y0-pad)*cs/sc, bx1=(best.x1+1+pad)*cs/sc, by1=(best.y1+1+pad)*cs/sc; cx=Math.max(0,Math.round(bx0)); cy=Math.max(0,Math.round(by0)); cw=Math.min(W-cx,Math.round(bx1-bx0)); ch=Math.min(H-cy,Math.round(by1-by0)); }
  const k=Math.min(2.5,1600/Math.max(cw,ch)); const ow=Math.round(cw*k), oh=Math.round(ch*k);
  const o=document.createElement('canvas'); o.width=ow; o.height=oh; const ox=o.getContext('2d',{willReadFrequently:true}); ox.drawImage(bm,cx,cy,cw,ch,0,0,ow,oh);
  const im=ox.getImageData(0,0,ow,oh), q=im.data; for(let i=0;i<q.length;i+=4){ const v=Math.max(q[i],q[i+1],q[i+2]); const t=v>115?0:255; q[i]=q[i+1]=q[i+2]=t; q[i+3]=255; } ox.putImageData(im,0,0);
  if(debug) window._prepDebug={crop:[cx,cy,cw,ch],best,url:o.toDataURL('image/png')};
  return new Promise(r=>o.toBlob(r,'image/png')); };

window.ddPrint=async(inp)=>{ const fs=[...(inp.files||[])]; if(!fs.length) return; const st=document.getElementById('ddPrintSt'); const msg=t=>{ if(st) st.textContent=t; };
  try{ msg('Preparando a leitura… na primeira vez baixa cerca de 5 MB.'); await lib();
    const w=await Tesseract.createWorker('por',1,{workerPath:'vendor/ocr/worker.min.js',corePath:'vendor/ocr',langPath:'vendor/ocr',gzip:true});
    const r={}; let i=0;
    try{ for(const f of fs){ i++; msg(fs.length>1?`Lendo a foto ${i} de ${fs.length}…`:'Lendo a foto…');
      let alvo=f; try{ alvo=await window.prepRelogio(f); }catch(e){ alvo=f; }
      let {data}=await w.recognize(alvo); let l=window.lerResumo(data.text);
      if(!Object.keys(l).length&&alvo!==f){ ({data}=await w.recognize(f)); l=window.lerResumo(data.text); }
      Object.entries(l).forEach(([k,v])=>{ if(r[k]==null) r[k]=v; }); }
    } finally { await w.terminate(); }
    let n=0; const map={min:'dd_min',fcMed:'dd_fcMed',fcMax:'dd_fcMax',cad:'dd_cad',pot:'dd_pot',kcal:'dd_kcal'};
    Object.entries(map).forEach(([k,id])=>{ const el=document.getElementById(id); if(el&&r[k]!=null){ el.value=r[k]; window.ddCampo(el); n++; } });
    msg(n?`Li ${n} ${n===1?'campo':'campos'}${r.km!=null?` (distância no print: ${String(r.km).replace('.',',')} km)`:''}. Confira antes de postar.`:'Não achei os números. Chegue mais perto, com a tela do relógio inteira e sem reflexo, ou preencha à mão.');
  }catch(e){ msg(e.message||'Não consegui ler agora.'); } finally { inp.value=''; } };
const _d=SH.dose; SH.dose=async(...a)=>{ const r=await _d(...a); const det=document.querySelector('#sheet details'); if(det&&!det.querySelector('.dd-print')){
  const box=document.createElement('div'); box.className='dd-print'; box.innerHTML=`<label class="btn sm sec" style="width:auto;margin-top:8px">${I('plus')} Ler do relógio (foto ou print)<input type="file" accept="image/*" multiple hidden onchange="ddPrint(this)"></label><p class="tiny" id="ddPrintSt" style="margin:6px 0 0">Dá para escolher várias fotos de uma vez. A leitura acontece no seu aparelho e a foto não sai dele.</p>`;
  det.querySelector('summary').insertAdjacentElement('afterend',box); }
  return r; };
})();

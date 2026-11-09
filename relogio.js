// ================= DOSE · v8.8 — "Ler do print" na dose do dia (aprovado pelo Tiago em 09/11/2026, Q3) =================
// Lê o print do resumo do treino (Apple Watch, Garmin ou outro app) no próprio aparelho, sem servidor e sem custo:
// Tesseract.js 5.1.1 (Apache-2.0) com o modelo de português, servidos pelo site em vendor/ocr/ e baixados só quando a pessoa usa (~5 MB).
// Os campos lidos entram nos mesmos campos editáveis da dose do dia; a pessoa confere e corrige antes de postar.
// Testado só com prints simulados (17 de 17 campos); prints reais ainda não testados (hipótese).
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
  const bpm=[...T.matchAll(/(\d{2,3})\s*bpm/g)].map(m=>+m[1]).filter(v=>v>=40&&v<=230);
  if(bpm.length){ const lm=T.match(/m[aá]x[^\n\d]*?(\d{2,3})\s*bpm/); out.fcMed=bpm.length>1?Math.min(...bpm):bpm[0]; if(bpm.length>1) out.fcMax=lm?+lm[1]:Math.max(...bpm); }
  else { const fm=T.match(/(?:fc|frequ[eê]ncia card[ií]aca)\s*m[eé]dia\D{0,20}(\d{2,3})/); if(fm) out.fcMed=+fm[1]; const fx=T.match(/(?:fc|frequ[eê]ncia card[ií]aca)\s*m[aá]x\w*\D{0,20}(\d{2,3})/); if(fx) out.fcMax=+fx[1]; }
  const ca=T.match(/calorias\s+ativas\D{0,30}?(\d{2,4})|(\d{2,4})\s*(?:k?cal)\b/); const cl=T.match(/calorias\D{0,20}?(\d{2,4})/);
  const kcalA=[...T.matchAll(/(\d{2,4})\s*k?cal\b/g)].map(m=>+m[1]);
  if(kcalA.length) out.kcal=Math.min(...kcalA); else if(cl) out.kcal=+cl[1];
  const cad=T.match(/(\d{2,3})\s*(?:ppm|spm|rpm)\b/)||T.match(/cad[eê]ncia[^\n\d]{0,30}(\d{2,3})/); if(cad) out.cad=+cad[1];
  const pot=T.match(/(\d{2,4})\s*w\b/)||T.match(/pot[eê]ncia[^\n\d]{0,20}(\d{2,4})/); if(pot) out.pot=+pot[1];
  return out; }
let carga=null;
function lib(){ if(window.Tesseract) return Promise.resolve(); if(carga) return carga; carga=new Promise((ok,erro)=>{ const s=document.createElement('script'); s.src='vendor/ocr/tesseract.min.js'; s.onload=ok; s.onerror=()=>{ carga=null; erro(new Error('Sem internet para carregar a leitura')); }; document.head.appendChild(s); }); return carga; }
window.ddPrint=async(inp)=>{ const f=inp.files&&inp.files[0]; if(!f) return; const st=document.getElementById('ddPrintSt'); const msg=t=>{ if(st) st.textContent=t; };
  try{ msg('Preparando a leitura… na primeira vez baixa cerca de 5 MB.'); await lib(); msg('Lendo o print…');
    const w=await Tesseract.createWorker('por',1,{workerPath:'vendor/ocr/worker.min.js',corePath:'vendor/ocr',langPath:'vendor/ocr',gzip:true});
    const {data}=await w.recognize(f); await w.terminate(); const r=window.lerResumo(data.text); let n=0;
    const map={min:'dd_min',fcMed:'dd_fcMed',fcMax:'dd_fcMax',cad:'dd_cad',pot:'dd_pot',kcal:'dd_kcal'};
    Object.entries(map).forEach(([k,id])=>{ const el=document.getElementById(id); if(el&&r[k]!=null){ el.value=r[k]; window.ddCampo(el); n++; } });
    msg(n?`Li ${n} ${n===1?'campo':'campos'}${r.km!=null?` (distância no print: ${String(r.km).replace('.',',')} km)`:''}. Confira antes de postar.`:'Não achei os números nesse print. Preencha à mão ou tente outro print.');
  }catch(e){ msg(e.message||'Não consegui ler esse print.'); } finally { inp.value=''; } };
const _d=SH.dose; SH.dose=async(...a)=>{ const r=await _d(...a); const det=document.querySelector('#sheet details'); if(det&&!det.querySelector('.dd-print')){
  const box=document.createElement('div'); box.className='dd-print'; box.innerHTML=`<label class="btn sm sec" style="width:auto;margin-top:8px">${I('plus')} Ler do print do relógio<input type="file" accept="image/*" hidden onchange="ddPrint(this)"></label><p class="tiny" id="ddPrintSt" style="margin:6px 0 0">A leitura acontece no seu aparelho. O print não sai dele.</p>`;
  det.querySelector('summary').insertAdjacentElement('afterend',box); }
  return r; };
})();
